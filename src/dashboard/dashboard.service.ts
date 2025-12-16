import { Injectable } from '@nestjs/common';
import { ExpensesService } from 'src/expenses/expenses.service';
import { ExpenseSort } from 'src/expenses/expenses.types';
import { IncomesService } from 'src/incomes/incomes.service';
import { IncomeSort } from 'src/incomes/incomes.types';
import { DashboardResponse } from './dto/dashboard-responses.dto';

@Injectable()
export class DashboardService {
    constructor(
        private readonly expensesService: ExpensesService,
        private readonly incomesService: IncomesService
    ) {}

    async getDashboard(userId: number): Promise<DashboardResponse> {
        const totalExpensesValue = await this.expensesService.getTotalExpensesValue(userId);
        const totalIncomesValue = await this.incomesService.getTotalIncomesValue(userId);
        
        const expenses = await this.expensesService.getFilteredExpenses(userId,{
            sort: ExpenseSort.DATE_DESC,
            limit: 5
        });
        const incomes = await this.incomesService.getFilteredIncomes(userId,{
            sort: IncomeSort.DATE_DESC,
            limit: 5
        });
        
        return {
            balance: totalIncomesValue - totalExpensesValue,
            totalExpenses: totalExpensesValue,
            totalIncomes: totalIncomesValue,
            expenses: expenses.data,
            incomes: incomes.data
        }
    }
}
