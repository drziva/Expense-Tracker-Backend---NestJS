import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from './expenses.entity';
import { Between, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { DeleteExpenseResponse, ExpenseResponse, GetExpenseResponse } from './dto/expenses-responses.dto';
import { ExpenseQueryOptions } from './expenses.types';
import { ExpenseGroup } from 'src/expense-groups/expense-groups.entity.ts';
import { UsersService } from 'src/users/users.service';
import { EmailService } from 'src/email/email.service';
import { User } from 'src/users/user.entity';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expense)
        private readonly expenseRepo: Repository<Expense>,
        @InjectRepository(ExpenseGroup)
        private readonly groupRepo: Repository<ExpenseGroup>,
        private readonly usersService: UsersService,
        private readonly emailService: EmailService
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

            await this.checkBudgetCap(user,dto,group);

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
                await this.emailService.sendBudgetCapAlert(user, group, total);
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

    private buildSortAndFilter(userId:number, options: ExpenseQueryOptions) {
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
