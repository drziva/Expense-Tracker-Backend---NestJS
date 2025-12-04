import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from './expenses.entity';
import { Repository } from 'typeorm';
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

        const expense = this.expenseRepo.create({
            amount: dto.amount,
            description: dto.description,
            user: user,
        });
        return await this.expenseRepo.save(expense);
    }

    async getAllExpenses(userId: number){
        return await this.expenseRepo.find({
            where: {user_id: userId }
        })
    }

    async deleteExpenseById(id: number, userId: number): Promise<boolean> {
        const result = await this.expenseRepo.delete({ id, user_id: userId});
        
        return(result.affected ?? 0) > 0;
    }

    async updateExpenseById(id: number, userId: number, dto: UpdateExpenseDto): Promise<boolean>{
        const result = await this.expenseRepo.update({ id, user_id: userId }, dto);
        
        return (result.affected ?? 0) > 0;
    }

}
