import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ScheduledTransaction } from './scheduled-transactions.entity';
import { TransactionEnum } from './dto/scheduled-transactions.types';
import { ExpenseGroupsService } from 'src/expense-groups/expense-groups.service';
import { IncomeGroupsService } from 'src/income-groups/income-groups.service';
import { ExpensesService } from 'src/expenses/expenses.service';
import { IncomesService } from 'src/incomes/incomes.service';

@Injectable()
export class ScheduledTransactionsScheduler {
  constructor(
    @InjectRepository(ScheduledTransaction)
    private readonly scheduledTransactionsRepo: Repository<ScheduledTransaction>,
    private readonly expenseGroupsService: ExpenseGroupsService,
    private readonly incomeGroupsService: IncomeGroupsService,
    private readonly expensesService: ExpensesService,
    private readonly incomesService: IncomesService,
    private readonly logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM, { timeZone: 'Europe/Belgrade' })
  async handleTransactions(): Promise<void> {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() +2);

    const transactions = await this.scheduledTransactionsRepo.find({where:{date:Between(start, end), processed:false}});

    for (const transaction of transactions) {
      if (transaction.type === TransactionEnum.INCOME) {
        if (transaction.income_group_id === null) {
          this.logger.log(
            `Income Group ID is null. Skipping transaction ${transaction.id}`,
          );
          continue;
        }

        try {
          await this.incomeGroupsService.findById(
            transaction.user_id,
            transaction.income_group_id,
          );

          await this.incomesService.create(
            {
              amount: transaction.amount,
              description: transaction.description,
              groupId: transaction.income_group_id,
            },
            transaction.user_id,
          );
          await this.scheduledTransactionsRepo.update(transaction.id,{
            processed:true
          });
        } catch (error: any) {
          this.logger.warn(
            `Skipping transaction ${transaction.id}: ${error?.message ?? error}`,
          );
          continue;
        }
      }

      if (transaction.type === TransactionEnum.EXPENSE) {
        if (transaction.expense_group_id === null) {
          this.logger.log(
            `Expense Group ID is null. Skipping transaction ${transaction.id}`,
          );
          continue;
        }

        try {
          await this.expenseGroupsService.findById(
            transaction.user_id,
            transaction.expense_group_id,
          );

          await this.expensesService.create(
            {
              amount: transaction.amount,
              description: transaction.description,
              groupId: transaction.expense_group_id,
            },
            transaction.user_id,
          );
          await this.scheduledTransactionsRepo.update(transaction.id,{
            processed:true
          });
        } catch (error: any) {
          this.logger.warn(
            `Skipping transaction ${transaction.id}: ${error?.message ?? error}`,
          );
          continue;
        }
      }
    }
  }
}
