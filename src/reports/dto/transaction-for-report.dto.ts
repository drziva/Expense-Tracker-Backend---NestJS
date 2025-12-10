import { ApiProperty } from '@nestjs/swagger';

export class TransactionForReport {
  @ApiProperty({ example: 150.75 })
  amount: number;

  @ApiProperty({ example: "Groceries at AutoZone", nullable: true })
  description: string | null;

  @ApiProperty({ example: "2025-01-01T12:00:00.000Z" })
  created_at: Date;

  @ApiProperty({ example: "Food & Groceries" })
  group: string;
}
