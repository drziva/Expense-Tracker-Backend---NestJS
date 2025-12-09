import { ApiProperty } from '@nestjs/swagger';

export class DeleteExpenseResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 12 })
  id: number;
}

export class ExpenseResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 49.99 })
  amount: number;

  @ApiProperty({ example: 'Groceries at AutoZone' })
  description: string;

  @ApiProperty({ example: '2025-01-10T15:42:00Z' })
  createdAt: Date;

  @ApiProperty({ example: 3 })
  groupId: number;
}

export class GetExpenseResponse {
  @ApiProperty({ type: () => [ExpenseResponse] })
  data: ExpenseResponse[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 73 })
  totalItems: number;

  @ApiProperty({ example: 8 })
  totalPages: number;
}
