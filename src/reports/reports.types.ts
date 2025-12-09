import { Expense } from "src/expenses/expenses.entity"
import { Income } from "src/incomes/incomes.entity"

export type ReportResponse = {
    totalIncomes: number,
    totalExpenses: number,
    balance: number,

    incomes: Income[],
    expenses: Expense[],

    expensesByGroup: Record<string,number>,
    incomesByGroup: Record<string, number>
}
