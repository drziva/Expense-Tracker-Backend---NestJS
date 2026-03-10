import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ExpensesModule } from 'src/expenses/expenses.module';
import { IncomesModule } from 'src/incomes/incomes.module';
import { Income } from 'src/incomes/incomes.entity';
import { Expense } from 'src/expenses/expenses.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, Income]),
    ExpensesModule,
    IncomesModule
  ],
  providers: [DashboardService],
  controllers: [DashboardController]
})
export class DashboardModule {}
