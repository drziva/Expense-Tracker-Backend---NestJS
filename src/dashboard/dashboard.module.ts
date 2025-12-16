import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ExpensesModule } from 'src/expenses/expenses.module';
import { IncomesModule } from 'src/incomes/incomes.module';

@Module({
  imports: [
    ExpensesModule,
    IncomesModule
  ],
  providers: [DashboardService],
  controllers: [DashboardController]
})
export class DashboardModule {}
