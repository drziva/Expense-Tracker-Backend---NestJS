import { ExpenseSort } from "./expense-sort.type";
import { Expense } from "./expenses.entity";

export type DeleteExpenseResponse = {
    success: boolean;
    id: number;
}

export type ExpenseResponse = {
    id: number;
    amount: number;
    description: string;
    createdAt: Date;
}

export type UpdateExpenseResponse = {
    success: boolean;
    id: number;
}

export type GetExpenseResponse = {
    data: Expense[],
    page: number,
    limit: number,
    totalItems: number,
    totalPages: number, 
};

export interface ExpenseQueryOptions {
    from?: Date;
    to?: Date;
    min?: number;
    max?: number;
    sort?: ExpenseSort;
    page?: number;
    limit?: number;
}