import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeleteIncomeResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 7 })
  id: number;
}

export class IncomeResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1500 })
  amount: number;

  @ApiProperty({ example: 'Salary for January' })
  description: string;

  @ApiProperty({ example: '2025-01-10T09:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: 2 })
  groupId: number;
  
  @ApiPropertyOptional({ example: 'Employment'})
  groupName?: string;
}

export class GetIncomeResponse {
  @ApiProperty({ type: () => [IncomeResponse] })
  data: IncomeResponse[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 42 })
  totalItems: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}
