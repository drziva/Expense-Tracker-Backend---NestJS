export type IncomeGroupResponse = {
    id: number;
    userId: number;
    name: string;
    description: string;
    createdAt: Date;
};

export type DeleteIncomeGroupResponse = {
    success: boolean;
    id: number;
};

export type GetIncomeGroupResponse = {
    data: IncomeGroupResponse[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
};

export enum IncomeGroupSortOrder {
    NAME_ASC = 'name_asc',
    NAME_DESC = 'name_desc',
    DATE_ASC = 'date_asc',
    DATE_DESC = 'date_desc',
}

export interface IncomeGroupQueryOptions {
    search?: string;
    sort?: IncomeGroupSortOrder;
    page?: number;
    limit?: number;

}
