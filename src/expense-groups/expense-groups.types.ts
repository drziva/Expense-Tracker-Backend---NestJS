export type BudgetStatus = {
    groupId: number,
    hasBudget: boolean,
    budgetCap: number | null,
    spentThisMonth: number,
    remaining: number | null,
    percentageUsed: number | null,
    isOverBudget: boolean,
}

export enum ExpenseSortOrder {
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  DATE_ASC = 'date_asc',
  DATE_DESC = 'date_desc',
}

export interface GroupQueryOptions {
    search?: string;
    sort?: ExpenseSortOrder;
    page?: number;
    limit?: number;
}
