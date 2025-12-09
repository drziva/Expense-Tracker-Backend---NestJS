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

export enum ExpenseSort {
  DATE_DESC = 'date_desc',
  DATE_ASC = 'date_asc',
  AMOUNT_DESC = 'amount_desc',
  AMOUNT_ASC = 'amount_asc',
}
