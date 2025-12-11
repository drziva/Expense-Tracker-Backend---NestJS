import { ApiProperty } from "@nestjs/swagger";
import { TransactionEnum } from "./scheduled-transactions.types";

export class ScheduledTransactionResponse {
  @ApiProperty({
    example: 12,
    description: "Unique ID of the scheduled transaction",
  })
  id: number;

  @ApiProperty({
    example: 3,
    description: "ID of the user who owns this transaction",
  })
  user_id: number;

  @ApiProperty({
    example: 450.00,
    description: "Amount of the scheduled transaction",
  })
  amount: number;

  @ApiProperty({
    example: "Paycheck for December",
    description: "Description provided by the user",
  })
  description: string;

  @ApiProperty({
    example: "2025-12-23T00:00:00.000Z",
    description: "Date when the transaction is scheduled to execute (ISO format)",
  })
  date: Date;

  @ApiProperty({
    enum: TransactionEnum,
    example: TransactionEnum.INCOME,
    description: "Type of the transaction (income or expense)",
  })
  type: TransactionEnum;

  @ApiProperty({
    example: 2,
    nullable: true,
    description:
      "Income group ID. Will be null when type = EXPENSE. Exactly one of incomeGroupId or expenseGroupId is non-null.",
  })
  incomeGroupId: number | null;

  @ApiProperty({
    example: 5,
    nullable: true,
    description:
      "Expense group ID. Will be null when type = INCOME. Exactly one of incomeGroupId or expenseGroupId is non-null.",
  })
  expenseGroupId: number | null;
}
