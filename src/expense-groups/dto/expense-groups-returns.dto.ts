import { ApiProperty } from '@nestjs/swagger';

export class GroupResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 12 })
  userId: number;

  @ApiProperty({ example: 'Food Budget' })
  name: string;

  @ApiProperty({ example: 'All monthly food-related expenses' })
  description: string;

  @ApiProperty({ example: '2025-01-10T14:20:00Z' })
  createdAt: Date;
}

export class DeleteGroupResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 3 })
  id: number;
}

export class GetGroupResponse {
  @ApiProperty({ type: () => [GroupResponse] })
  data: GroupResponse[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 42 })
  totalItems: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class BudgetStatus {
  @ApiProperty({ example: 2 })
  groupId: number;

  @ApiProperty({ example: true })
  hasBudget: boolean;

  @ApiProperty({ example: 500, nullable: true })
  budgetCap: number | null;

  @ApiProperty({ example: 140 })
  spentThisMonth: number;

  @ApiProperty({ example: 360, nullable: true })
  remaining: number | null;

  @ApiProperty({ example: 28, nullable: true })
  percentageUsed: number | null;

  @ApiProperty({ example: false })
  isOverBudget: boolean;
}
