export type GroupResponse = {
    id: number,
    userId: number,
    name: string,
    description: string,
    createdAt: Date,
}

export type DeleteGroupResponse = {
    success: boolean,
    id: number
}

export type GetGroupResponse = {
    data: GroupResponse[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
};

export type BudgetStatus = {
    groupId: number,
    hasBudget: boolean,
    budgetCap: number | null,
    spentThisMonth: number,
    remaining: number | null,
    percentageUsed: number | null,
    isOverBudget: boolean,
}

export interface GroupQueryOptions {
    search?: string;
    sort?: 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc';
    page?: number;
    limit?: number;
}