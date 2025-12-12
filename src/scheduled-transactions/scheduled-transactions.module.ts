import { Logger, Module } from '@nestjs/common';
import { ScheduledTransactionsService } from './scheduled-transactions.service';
import { ScheduledTransactionsController } from './scheduled-transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduledTransaction } from './scheduled-transactions.entity';
import { ExpenseGroupsModule } from 'src/expense-groups/expense-groups.module';
import { IncomeGroupsModule } from 'src/income-groups/income-groups.module';
import { ScheduledTransactionsScheduler } from './sheduled-transactions.scheduler';
import { UsersModule } from 'src/users/users.module';
import { IncomesModule } from 'src/incomes/incomes.module';
import { ExpensesModule } from 'src/expenses/expenses.module';
import { ExpenseGroup } from 'src/expense-groups/expense-groups.entity.ts';
import { IncomeGroup } from 'src/income-groups/income-groups.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduledTransaction, ExpenseGroup, IncomeGroup]),
    ExpenseGroupsModule,
    IncomeGroupsModule,
    UsersModule,
    IncomesModule,
    ExpensesModule
  ],
  providers: [
    ScheduledTransactionsService,
    ScheduledTransactionsScheduler,
    Logger
  ],
  controllers: [ScheduledTransactionsController]
})
export class ScheduledTransactionsModule {}
