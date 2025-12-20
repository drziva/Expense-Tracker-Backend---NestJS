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
    from?: Date;
    to?: Date;
}
