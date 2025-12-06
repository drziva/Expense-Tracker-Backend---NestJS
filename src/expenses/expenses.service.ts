import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from './expenses.entity';
import { Between, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UsersService } from 'src/users/users.service';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { DeleteExpenseResponse, ExpenseQueryOptions, ExpenseResponse, GetExpenseResponse, UpdateExpenseResponse } from './expenses.types';
import { ExpenseGroup } from 'src/expense-groups/expense-groups.entity.ts';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expense)
        private expenseRepo: Repository<Expense>,

        @InjectRepository(ExpenseGroup)
        private groupRepo: Repository<ExpenseGroup>,

        private usersService: UsersService,
    ){}
    
    async create(dto: CreateExpenseDto, userId: number): Promise<ExpenseResponse> {
        const user = await this.usersService.findById(userId);
        if (!user) { throw new NotFoundException("User does not exist"); }

        const group = await this.groupRepo.findOne({ where: { id: dto.group_id }});
        if (!group) throw new NotFoundException("Group not found");
        if (group.user_id !== userId) {
        throw new ForbiddenException("Invalid group selection");
        }

        try {
            const expense = this.expenseRepo.create({
                amount: dto.amount,
                description: dto.description,
                group_id:dto.group_id,
                user_id: userId,
            });
            const savedExpense = await this.expenseRepo.save(expense);
            return this.toExpenseResponse(savedExpense);
        } catch (error) {
            console.error("Error creating expense:", error);
            throw new InternalServerErrorException("Failed to create expense");
        }
    }

    async getFilteredExpenses(userId: number, options: ExpenseQueryOptions): Promise<GetExpenseResponse> {
        const where: any = { user_id: userId};
        const { from, to, min, max, sort, page = 1, limit = 20, search, group, group_id } = options;
        //Filtering
        if (group_id !== undefined) {
            const groupEntity = await this.groupRepo.findOne({
                where: { id: group_id, user_id: userId }
                });
                if (!groupEntity) {
                    return {
                        data: [],
                        page,
                        limit,
                        totalItems: 0,
                        totalPages: 0
                    };
                }
            where.group_id = group_id;
        }
        else if (group) {
            const groupEntity = await this.groupRepo.findOne({
            where: { name: group, user_id: userId }
                });
                if (!groupEntity) {
                    return {
                        data: [],
                        page,
                        limit,
                        totalItems: 0,
                        totalPages: 0
                    };
                }
            where.group_id = groupEntity.id;
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
        //Pagination
        const skip = (page - 1) * limit;
        const [data, total] = await this.expenseRepo.findAndCount({ where, order, skip, take: limit});

        return {
            data: data.map( exp=> this.toExpenseResponse(exp) ),
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
        }
    }

    async getExpenseById(id: number, userId: number): Promise<ExpenseResponse> {
        const expense = await this.expenseRepo.findOne({ where: { id, user_id: userId },});
        if (!expense) {
            throw new NotFoundException("Expense not found");
        }
        return this.toExpenseResponse(expense);
    }

    async getCustomReport(userId: number, from?: Date, to?: Date) {
        return { message: "Report generation not yet implemented." };
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
            throw new InternalServerErrorException("Failed to delete expense");
    }
    }

    async updateExpenseById(id: number, userId: number, dto: UpdateExpenseDto): Promise<UpdateExpenseResponse> {
        const expense = await this.expenseRepo.findOne({ where: { id } });
            if (!expense || expense.user_id !== userId) {
                throw new NotFoundException("Expense not found");
        }
        if(dto.group_id) {
            const group = await this.groupRepo.findOne({where:{id:dto.group_id}})
            if(!group || group.user_id !== userId){
                throw new NotFoundException("Group not found");
            }
            expense.group_id = dto.group_id;
        }
        if(dto.amount !== undefined) expense.amount = dto.amount;
        if(dto.description !== undefined) expense.description = dto.description;
        
        try{
            const updatedExpense = await this.expenseRepo.save(expense);
            return {
                success:true,
                expense: this.toExpenseResponse(updatedExpense)
            }
        } catch(error){
            console.error(error);
            throw new InternalServerErrorException("Updating expense failed");
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
            groupId: expense.group_id
        };
    }

}
