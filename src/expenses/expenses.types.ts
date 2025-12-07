import { ExpenseSort } from "./expense-sort.type";

export type DeleteExpenseResponse = {
    success: boolean;
    id: number;
}

export type ExpenseResponse = {
    id: number;
    amount: number;
    description: string;
    createdAt: Date;
    groupId: number
}

export type GetExpenseResponse = {
    data: ExpenseResponse[],
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
    search?: string;
    group?: string;
    group_id?: number;
}