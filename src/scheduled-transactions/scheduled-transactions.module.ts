import { Module } from '@nestjs/common';
import { ScheduledTransactionsService } from './scheduled-transactions.service';
import { ScheduledTransactionsController } from './scheduled-transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduledTransaction } from './scheduled-transactions.entity';
import { ExpenseGroupsModule } from 'src/expense-groups/expense-groups.module';
import { IncomeGroupsModule } from 'src/income-groups/income-groups.module';
import { ExpenseGroup } from 'src/expense-groups/expense-groups.entity.ts';
import { IncomeGroup } from 'src/income-groups/income-groups.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduledTransaction, ExpenseGroup, IncomeGroup]),
    ExpenseGroupsModule,
    IncomeGroupsModule
  ],
  providers: [ScheduledTransactionsService],
  controllers: [ScheduledTransactionsController]
})
export class ScheduledTransactionsModule {}
