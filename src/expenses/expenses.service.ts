import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from './expenses.entity';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UsersService } from 'src/users/users.service';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expense)
        private expenseRepo: Repository<Expense>,
        private usersService: UsersService,
    ){}
    
    async create(dto: CreateExpenseDto, userId: number): Promise<Expense> {
        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new NotFoundException("User does not exist");
        }
        try {
            const expense = this.expenseRepo.create({
                amount: dto.amount,
                description: dto.description,
                user: user,
            });
            return await this.expenseRepo.save(expense);
        } catch (error) {
            console.error("Error creating expense:", error);
            throw new InternalServerErrorException("Failed to create expense");
        }
    }

    async getAllExpenses(userId: number){
        return await this.expenseRepo.find({
            where: {user_id: userId }
        })
    }

    async getFilteredExpenses(userId: number, from?: Date, to?: Date, minRaw?: string, maxRaw?: string): Promise<Expense[]> {
        const where: any = { user_id: userId};
        if (from && to) {
            where.created_at = Between(from, to);
        } else if (from) {
            where.created_at = MoreThanOrEqual(from);
        } else if (to) {
            where.created_at = LessThanOrEqual(to);
        }

        const min = minRaw ? Number(minRaw) : undefined;
        const max = maxRaw ? Number(maxRaw) : undefined;
        
        if (min !== undefined && max !== undefined) {
            where.amount = Between(min, max);
        } else if (min !== undefined) {
            where.amount = MoreThanOrEqual(min);
        } else if (max !== undefined) {
            where.amount = LessThanOrEqual(max);
        }
        return await this.expenseRepo.find({ where });
    }

    async getExpenseById(id: number, userId: number): Promise<Expense> {
        const expenses = await this.getAllExpenses(userId);
        const expense = expenses.find(exp => exp.id === id);
        if (!expense) {
          throw new NotFoundException('Expense not found');
        }
        return expense;
    }

    async getTotalExpensesValue(userId: number): Promise<number> {
        const expenses = await this.getAllExpenses(userId);
        return expenses.reduce((total, expense) => total + Number(expense.amount ?? 0), 0);
    }

    async deleteExpenseById(id: number, userId: number): Promise<boolean> {
        try {
            const result = await this.expenseRepo.delete({ id, user_id: userId});
        return(result.affected ?? 0) > 0;
        } catch (error) {
            console.error("Error deleting expense:", error);
            throw new InternalServerErrorException("Failed to delete expense");
        }
    }

    async updateExpenseById(id: number, userId: number, dto: UpdateExpenseDto): Promise<boolean>{
        try {
            const result = await this.expenseRepo.update({ id, user_id: userId }, dto);

            return (result.affected ?? 0) > 0;
        } catch (error) {
            console.error("Error updating expense:", error);
            throw new InternalServerErrorException("Failed to update expense");
        }
    }
}
