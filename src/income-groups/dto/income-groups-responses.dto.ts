import { ApiProperty } from '@nestjs/swagger';

export class IncomeGroupResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 42 })
  userId: number;

  @ApiProperty({ example: 'Salary' })
  name: string;

  @ApiProperty({ example: 'All salary-related incomes' })
  description: string;

  @ApiProperty({ example: '2025-01-10T15:30:00Z' })
  createdAt: Date;
}

export class DeleteIncomeGroupResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 5 })
  id: number;
}

export class GetIncomeGroupResponse {
  @ApiProperty({ type: () => [IncomeGroupResponse] })
  data: IncomeGroupResponse[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 27 })
  totalItems: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}
