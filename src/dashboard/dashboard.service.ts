import { Injectable, NotFoundException } from '@nestjs/common';
import { ExpensesService } from 'src/expenses/expenses.service';
import { ExpenseSort } from 'src/expenses/expenses.types';
import { IncomesService } from 'src/incomes/incomes.service';
import { IncomeSort } from 'src/incomes/incomes.types';
import { DashboardResponse } from './dto/dashboard-responses.dto';
import { Income } from 'src/incomes/incomes.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Income)
        private readonly incomeRepo: Repository<Income>, 
        private readonly expensesService: ExpensesService,
        private readonly incomesService: IncomesService,
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
    async getDashboardSummary(
        userId: number,
        from: Date,
        to: Date
        ): Promise<{ date: string; income: number; expense: number }[]> {

        if (from.getTime() > to.getTime()) {
            throw new NotFoundException(
            "Invalid date range: 'from' date must be before 'to' date"
            );
        }

        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            throw new NotFoundException("Invalid date format");
        }

        const result = await this.incomeRepo.query(
            `
            WITH RECURSIVE dates AS (
            SELECT DATE(?) AS day
            UNION ALL
            SELECT DATE_ADD(day, INTERVAL 1 DAY)
            FROM dates
            WHERE day < DATE(?)
            )

            SELECT
            dates.day AS date,
            COALESCE(income.total, 0) AS income,
            COALESCE(expense.total, 0) AS expense
            FROM dates

            LEFT JOIN (
            SELECT
                DATE(created_at) AS day,
                SUM(amount) AS total
            FROM incomes
            WHERE user_id = ?
            AND created_at BETWEEN ? AND ?
            GROUP BY DATE(created_at)
            ) income
            ON income.day = dates.day

            LEFT JOIN (
            SELECT
                DATE(created_at) AS day,
                SUM(amount) AS total
            FROM expenses
            WHERE user_id = ?
            AND created_at BETWEEN ? AND ?
            GROUP BY DATE(created_at)
            ) expense
            ON expense.day = dates.day

            ORDER BY dates.day ASC
            `,
            [from, to, userId, from, to, userId, from, to]
        );

        return result.map((row) => ({
            date: row.date.toISOString().split("T")[0],
            income: Number(row.income),
            expense: Number(row.expense),
        }));
    }
}
