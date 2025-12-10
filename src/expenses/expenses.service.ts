import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from './expenses.entity';
import { Between, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { DeleteExpenseResponse, ExpenseResponse, GetExpenseResponse } from './dto/expenses-responses.dto';
import { ExpenseQueryOptions } from './expenses.types';
import { ExpenseGroup } from 'src/expense-groups/expense-groups.entity.ts';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expense)
        private expenseRepo: Repository<Expense>,
        @InjectRepository(ExpenseGroup)
        private groupRepo: Repository<ExpenseGroup>,
    ){}
    
    async create(dto: CreateExpenseDto, userId: number): Promise<ExpenseResponse> {
        try {
            const group = await this.groupRepo.findOne({ where: { id: dto.groupId, user_id:userId }});
            if (!group) throw new NotFoundException("Group not found");
            const expense = this.expenseRepo.create({
                amount: dto.amount,
                description: dto.description,
                group_id:dto.groupId,
                user_id: userId,
            });
            const savedExpense = await this.expenseRepo.save(expense);
            return this.toExpenseResponse(savedExpense);
        } catch (error) {
            console.error("Error creating expense:", error);
            throw error;
        }
    }

    async getFilteredExpenses(userId: number, options: ExpenseQueryOptions): Promise<GetExpenseResponse> {
        const where: any = { user_id: userId};
        const { from, to, min, max, sort, page = 1, limit = 20, search, group_id } = options;
        //FilteringD
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
