export type DeleteIncomeResponse = {
    success: boolean;
    id: number;
}

export type IncomeResponse = {
    id: number;
    amount: number;
    description: string;
    createdAt: Date;
    groupId: number
}

export type GetIncomeResponse = {
    data: IncomeResponse[],
    page: number,
    limit: number,
    totalItems: number,
    totalPages: number, 
};

export interface IncomeQueryOptions {
    from?: Date;
    to?: Date;
    min?: number;
    max?: number;
    sort?: IncomeSort;
    page?: number;
    limit?: number;
    search?: string;
    group?: string;
    group_id?: number;
}

export enum IncomeSort {
  DATE_DESC = 'date_desc',
  DATE_ASC = 'date_asc',
  AMOUNT_DESC = 'amount_desc',
  AMOUNT_ASC = 'amount_asc',
}
