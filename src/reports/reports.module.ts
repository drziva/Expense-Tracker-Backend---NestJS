import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ExpensesModule } from '../expenses/expenses.module';
import { IncomesModule } from '../incomes/incomes.module';
import { ExpenseGroupsModule } from '../expense-groups/expense-groups.module';
import { IncomeGroupsModule } from '../income-groups/income-groups.module';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ExpensesModule,
    IncomesModule,
    ExpenseGroupsModule,
    IncomeGroupsModule,
    EmailModule,
    UsersModule
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService]
})
export class ReportsModule {}
