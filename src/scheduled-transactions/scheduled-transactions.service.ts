import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ScheduledTransaction } from './scheduled-transactions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateScheduledTransactionDto } from './dto/create-scheduled-transaction.dto';
import { TransactionEnum } from './dto/scheduled-transactions.types';
import { ExpenseGroup } from 'src/expense-groups/expense-groups.entity.ts';
import { IncomeGroup } from 'src/income-groups/income-groups.entity';
import { ScheduledTransactionResponse } from './dto/scheduled-transactions-responses';
import { UpdateScheduledTransactionDto } from './dto/update-scheduled-transaction.dto';
import { DeleteScheduledTransactionResponse } from './dto/delete-scheduled-transaction.dto';
import { IncomesService } from 'src/incomes/incomes.service';
import { ExpensesService } from 'src/expenses/expenses.service';

@Injectable()
export class ScheduledTransactionsService {
  constructor(
    @InjectRepository(ScheduledTransaction)
    private readonly scheduledTransactionsRepo: Repository<ScheduledTransaction>,
    @InjectRepository(ExpenseGroup)
    private readonly expenseGroupRepo: Repository<ExpenseGroup>,
    @InjectRepository(IncomeGroup)
    private readonly incomeGroupRepo: Repository<IncomeGroup>,
    private readonly incomesService: IncomesService,
    private readonly expensesService: ExpensesService,
    private readonly logger: Logger
  ) {}

  async getAll(userId: number): Promise<ScheduledTransactionResponse[]> {
<<<<<<< HEAD
    const transactions = await this.scheduledTransactionsRepo.find({ where: { user_id:userId }, relations:["group"] });
=======
    const transactions = await this.scheduledTransactionsRepo.find({ where: { user_id:userId }, relations:["income_group","expense_group"] });
>>>>>>> e29ffcf1d585809e569eb1553582c458883a827a
    return transactions.map(tr=>(this.toScheduledTransactionResponse(tr)));
  }

  async create(userId: number,dto:CreateScheduledTransactionDto): Promise<ScheduledTransactionResponse> {
    try{
      await this.validateTransaction(userId,dto);
      const scheduledTransaction = this.scheduledTransactionsRepo.create({
        user_id: userId,
        description: dto.description,
        amount: dto.amount,
        date: dto.date,
        type: dto.type,
        income_group_id: dto.type===TransactionEnum.INCOME ? dto.incomeGroupId : null,
        expense_group_id: dto.type===TransactionEnum.EXPENSE ? dto.expenseGroupId : null,
      });
        const saved = await this.scheduledTransactionsRepo.save(scheduledTransaction);

        return this.toScheduledTransactionResponse(saved);
    } catch(error) {
      this.logger.error(
        'Error creating transaction',
        error?.stack ?? error,
      );
        throw error;
    }
  }

  async update(userId: number, id:number, dto:UpdateScheduledTransactionDto): Promise<ScheduledTransactionResponse> {
    try {    
    await this.validateTransaction(userId,dto);
    const transaction = await this.scheduledTransactionsRepo.findOne({where:{id,user_id:userId}});
    if(!transaction){
      throw new NotFoundException("The specified transaction was not found");
    }
    transaction.amount = dto.amount;
    transaction.date = dto.date;
    transaction.description = dto.description;
    transaction.type = dto.type;
    transaction.expense_group_id = dto.expenseGroupId ?? null;
    transaction.income_group_id = dto.incomeGroupId ?? null;

    const saved = await this.scheduledTransactionsRepo.save(transaction);
    return this.toScheduledTransactionResponse(saved);
    } catch(error) {
      this.logger.error(
        'Error updating transaction',
        error?.stack ?? error,
      );
      throw error;
    }
  }

  async delete(userId: number, id: number): Promise<DeleteScheduledTransactionResponse> {
    const transaction = await this.scheduledTransactionsRepo.findOne({where:{id, user_id: userId }});
    if(!transaction){
      throw new NotFoundException("The specified transaction was not found")
    }
    try {
      await this.scheduledTransactionsRepo.delete(id);
      return {
        success:true,
        id:id
      }
    } catch(error) {
      this.logger.error(
        'Error deleting transaction',
        error?.stack ?? error,
      );
      throw error;
    }
  }

  async createIncomeFromTransaction(transaction: ScheduledTransaction): Promise<void> {
    await this.incomesService.create(
      {
        amount: transaction.amount,
        description: transaction.description,
        groupId: transaction.income_group_id!,
      },
      transaction.user_id,
    );
    await this.scheduledTransactionsRepo.update(transaction.id,{
      processed:true
    });
  }

  async createExpenseFromTransaction(transaction: ScheduledTransaction): Promise<void> {
    await this.expensesService.create(
      {
        amount: transaction.amount,
        description: transaction.description,
        groupId: transaction.expense_group_id!,
      },
      transaction.user_id,
    );
    await this.scheduledTransactionsRepo.update(transaction.id,{
      processed:true
    });
  }

  private async validateTransaction(
    userId: number,
    dto: CreateScheduledTransactionDto | UpdateScheduledTransactionDto
  ): Promise<void> {
    const now = new Date();
    if (dto.date.getTime() <= now.getTime()) {
      throw new ConflictException("Date must be in the future");
    }

    if (dto.type === TransactionEnum.EXPENSE) {
      const group = await this.expenseGroupRepo.findOne({
        where: { user_id: userId, id: dto.expenseGroupId }
      });
      if (!group) {
        throw new NotFoundException("Expense group not found");
      }
    } else {
      const group = await this.incomeGroupRepo.findOne({
        where: { user_id: userId, id: dto.incomeGroupId }
      });
      if (!group) {
        throw new NotFoundException("Income group not found");
      }
    }
  }

  private toScheduledTransactionResponse(schedTransaction: ScheduledTransaction): ScheduledTransactionResponse {
    return {
      id:schedTransaction.id,
      userId: schedTransaction.user_id,      
      amount:schedTransaction.amount,
      description: schedTransaction.description,
      date: schedTransaction.date,
      type: schedTransaction.type,
      incomeGroupId: schedTransaction.income_group_id,
      expenseGroupId: schedTransaction.expense_group_id,
      expenseGroupName: schedTransaction.expense_group?.name,
<<<<<<< HEAD
      incomeGroupName: schedTransaction.income_group?.name
=======
      incomeGroupName: schedTransaction.income_group?.name,
>>>>>>> e29ffcf1d585809e569eb1553582c458883a827a
    }
  }
}
