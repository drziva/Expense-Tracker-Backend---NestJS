import { ApiProperty } from '@nestjs/swagger';

export class BudgetStatusDto {
  @ApiProperty()
  groupId: number;

  @ApiProperty()
  hasBudget: boolean;

  @ApiProperty({ nullable: true })
  budgetCap: number | null;

  @ApiProperty()
  spentThisMonth: number;

  @ApiProperty({ nullable: true })
  remaining: number | null;

  @ApiProperty({ nullable: true })
  percentageUsed: number | null;

  @ApiProperty()
  isOverBudget: boolean;
}
