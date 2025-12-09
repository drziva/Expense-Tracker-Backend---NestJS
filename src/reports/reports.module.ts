import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ExpensesModule } from 'src/expenses/expenses.module';
import { IncomesModule } from 'src/incomes/incomes.module';
import { ExpenseGroupsModule } from 'src/expense-groups/expense-groups.module';
import { IncomeGroupsModule } from 'src/income-groups/income-groups.module';

@Module({
  imports: [
    ExpensesModule,
    IncomesModule,
    ExpenseGroupsModule,
    IncomeGroupsModule
  ],
  controllers: [ReportsController],
  providers: [ReportsService]
})
export class ReportsModule {}
