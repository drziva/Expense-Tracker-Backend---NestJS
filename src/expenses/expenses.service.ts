import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from './expenses.entity';
import { Between, FindOptionsOrder, FindOptionsWhere, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { DeleteExpenseResponse, ExpenseResponse, GetExpenseResponse } from './dto/expenses-responses.dto';
import { ExpenseQueryOptions } from './expenses.types';
import { ExpenseGroup } from 'src/expense-groups/expense-groups.entity.ts';
import { UsersService } from 'src/users/users.service';
import { EmailService } from 'src/email/email.service';
import { User } from 'src/users/user.entity';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expense)
        private readonly expenseRepo: Repository<Expense>,
        @InjectRepository(ExpenseGroup)
        private readonly groupRepo: Repository<ExpenseGroup>,
        private readonly usersService: UsersService,
        private readonly emailService: EmailService,
        private readonly firebaseService: FirebaseService
    ){}
        
    async create(dto: CreateExpenseDto, userId: number): Promise<ExpenseResponse> {
        try {
            const group = await this.groupRepo.findOne({
                where: { id: dto.groupId, user_id: userId }
            });
            if (!group) throw new NotFoundException("Group not found");
            const expense = this.expenseRepo.create({
                amount: dto.amount,
                description: dto.description,
                group_id: dto.groupId,
                user_id: userId,
            });
            const saved = await this.expenseRepo.save(expense);
            const user = await this.usersService.findById(userId);
            
            if (!user?.premium || !user?.budget_cap_notifications || group.monthly_budget_cap === null) {
                return this.toExpenseResponse(saved);
            }

            await this.checkBudgetCap(user, dto, group);

            return this.toExpenseResponse(saved);
        } catch (error) {
            console.error("Error creating expense:", error);
            throw error;
        }
    }

    async getFilteredExpenses(userId: number, options: ExpenseQueryOptions): Promise<GetExpenseResponse> {
        const {where, order} = this.buildSortAndFilter(userId,options);
        const {page=1, limit=20} = options;
        //Pagination
        const skip = (page - 1) * limit;
        const [data, total] = await this.expenseRepo.findAndCount({ where, order, skip, take: limit, relations:["group"]});
        return {
            data: data.map( exp=> this.toExpenseResponse(exp) ),
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
        }
    }

    async getFilteredForPdf(userId, options): Promise<ExpenseResponse[]> {
        const {where, order} = this.buildSortAndFilter(userId,options);
        const expenses = await this.expenseRepo.find({where, order, relations:["group"]});

        return expenses.map(exp => this.toExpenseResponse(exp));
    }

    async getExpenseById(id: number, userId: number): Promise<ExpenseResponse> {
        const expense = await this.expenseRepo.findOne({ where: { id, user_id: userId }, relations:["group"]});
        if (!expense) {
            throw new NotFoundException("Expense not found");
        }
        return this.toExpenseResponse(expense);
    }

    async getTotalExpensesValue(userId: number): Promise<number> {
        const expenses = await this.getAllExpenses(userId);
        return expenses.reduce((total, expense) => total + Number(expense.amount ?? 0), 0);
    }

    async deleteExpenseById(id: number, userId: number): Promise<DeleteExpenseResponse> {
        try {
            const result = await this.expenseRepo.delete({ id, user_id: userId });

            return {
                success: (result.affected ?? 0) > 0,
                id
            };
        } catch (error) {
            console.error("Error deleting expense:", error);
            throw error;
        }
    }

    async updateExpenseById(id: number, userId: number, dto: UpdateExpenseDto): Promise<ExpenseResponse> {
      try{
            const expense = await this.expenseRepo.findOne({ where: { id, user_id:userId } });
                if (!expense) {
                    throw new NotFoundException("Expense not found");
            }
            if(dto.groupId) {
                const group = await this.groupRepo.findOne({where:{id:dto.groupId, user_id:userId}})
                if(!group){
                    throw new NotFoundException("Group not found");
                }
                expense.group_id = dto.groupId;
            }
            expense.amount = dto.amount;
            expense.description = dto.description;

            const updatedExpense = await this.expenseRepo.save(expense);
            return this.toExpenseResponse(updatedExpense)
        } catch(error){
            console.error(error);
            throw error;
        }
    }

    async getForReport(userId: number, from?: Date, to?: Date): Promise<Expense[]> {
        const where: any = {user_id : userId}
        if(from && to){
            where.created_at = Between(from,to);
        } else if(from){
            where.created_at = MoreThanOrEqual(from);
        } else if(to){
            where.created_at = LessThanOrEqual(to);
        }
        return await this.expenseRepo.find({where});
    }

    async getSummaryByDay(
        userId: number,
        from: Date,
        to: Date
        ): Promise<{ date: string; total: number }[]> {

        if (from.getTime() > to.getTime()) {
            throw new NotFoundException(
            "Invalid date range: 'from' date must be before 'to' date"
            );
        }

        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            throw new NotFoundException("Invalid date format");
        }

        const result = await this.expenseRepo.query(
            `
            WITH RECURSIVE dates AS (
            SELECT DATE(?) AS day
            UNION ALL
            SELECT DATE_ADD(day, INTERVAL 1 DAY)
            FROM dates
            WHERE day < DATE(?)
            )
            SELECT
            dates.day AS date,
            COALESCE(SUM(expense.amount), 0) AS total
            FROM dates
            LEFT JOIN expenses expense
            ON DATE(expense.created_at) = dates.day
            AND expense.user_id = ?
            GROUP BY dates.day
            ORDER BY dates.day ASC
            `,
            [from, to, userId]
        );

        return result.map((row) => ({
            date: row.date.toISOString().split("T")[0],
            total: Number(row.total),
        }));
    }

    async getSummaryByMonth(
        userId: number,
        from: Date,
        to: Date
        ): Promise<{ date: string; total: number }[]> {

        if (from.getTime() > to.getTime()) {
            throw new NotFoundException(
            "Invalid date range: 'from' date must be before 'to' date"
            );
        }

        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            throw new NotFoundException("Invalid date format");
        }

        const result = await this.expenseRepo.query(
            `
            WITH RECURSIVE months AS (
            SELECT DATE_FORMAT(DATE(?), '%Y-%m-01') AS month_start
            UNION ALL
            SELECT DATE_ADD(month_start, INTERVAL 1 MONTH)
            FROM months
            WHERE month_start < DATE_FORMAT(DATE(?), '%Y-%m-01')
            )
            SELECT
            months.month_start AS date,
            COALESCE(SUM(expense.amount), 0) AS total
            FROM months
            LEFT JOIN expenses expense
            ON DATE_FORMAT(expense.created_at, '%Y-%m-01') = months.month_start
            AND expense.user_id = ?
            GROUP BY months.month_start
            ORDER BY months.month_start ASC
            `,
            [from, to, userId]
        );

        return result.map((row) => ({
            date: row.date,
            total: Number(row.total),
        }));
    }

    private async checkBudgetCap(user: User,dto: CreateExpenseDto, group: ExpenseGroup): Promise<void> {
        const now = new Date();
            const lastSent = group.last_budget_alert;
            const sentThisMonth =
                lastSent &&
                lastSent.getFullYear() === now.getFullYear() &&
                lastSent.getMonth() === now.getMonth();
        if(!sentThisMonth) {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0,0,0,0);

            const total = await this.expenseRepo.sum("amount", {
                user_id: user.id,
                group_id: dto.groupId,
                created_at: MoreThanOrEqual(startOfMonth)
            }) ?? 0;
            if(total > group.monthly_budget_cap!){
                //DISABLED FOR NOW, SHOULD BE REPLACED BY FIREBASE NOTIFICATIONS
                //await this.emailService.sendBudgetCapAlert(user, group, total); 
                await this.firebaseService.sendNotificationToUser(user.id, {
                    title: "Budget Cap Alert",
                    body: `You have exceeded the budget cap for ${group.name}. Total this month: ${total.toFixed(2)} €.`
                });
                group.last_budget_alert = now;
                await this.groupRepo.save(group);
            }
        }
    }

    private async getAllExpenses(userId: number): Promise<ExpenseResponse[]> {
        const expenses = await this.expenseRepo.find({ where: { user_id: userId } });
        return expenses.map(expense => this.toExpenseResponse(expense));
    }

    private toExpenseResponse(expense: Expense): ExpenseResponse {
        return {
            id: expense.id,
            amount: Number(expense.amount),
            description: expense.description,
            createdAt: expense.created_at,
            groupId: expense.group_id,
            groupName: expense.group?.name
        };
    }

    private buildSortAndFilter(userId:number, options: ExpenseQueryOptions): {
            where: FindOptionsWhere<Expense>,
            order: FindOptionsOrder<Expense>
        }  {
        const where: any = { user_id: userId};
        const { from, to, min, max, sort, search, group_id } = options;
        //Filtering
        if (group_id !== undefined) {
            where.group_id = group_id;
        }

        if (from && to) {
            where.created_at = Between(from, to);
        } else if (from) {
            where.created_at = MoreThanOrEqual(from);
        } else if (to) {
            where.created_at = LessThanOrEqual(to);
        }

        if (min !== undefined && max !== undefined) {
            where.amount = Between(min, max);
        } else if (min !== undefined) {
            where.amount = MoreThanOrEqual(min);
        } else if (max !== undefined) {
            where.amount = LessThanOrEqual(max);
        }
        if (search) {
            where.description =  Like(`%${search}%`);
        }
        //Sorting
        let order: any = { created_at: 'DESC' }; // Default order
        switch(sort) {
            case 'amount_asc':
                order = { amount: 'ASC' };
                break;
            case 'amount_desc':
                order = { amount: 'DESC' };
                break;
            case 'date_asc':
                order = { created_at: 'ASC' };
                break;
            case 'date_desc':
                order = { created_at: 'DESC' };
                break;
        }

        return {where, order}
    }
}
