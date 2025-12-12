import { Type } from "class-transformer";
import { 
  IsDate, 
  IsEnum, 
  IsNotEmpty, 
  IsNumber, 
  IsPositive, 
  IsString,
  ValidateIf 
} from "class-validator";
import { TransactionEnum } from "./scheduled-transactions.types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateScheduledTransactionDto {
 @ApiProperty({
    example: 450,
    description: 'Amount of the scheduled transaction',
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: 'Paycheck',
    description: 'Description of the scheduled transaction'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '2025-12-23',
    description: 'Date when the transaction should be executed (ISO 8601 format)',
  })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    enum: TransactionEnum,
    example: TransactionEnum.INCOME,
    description: 'Transaction type (income or expense)',
  })
  @IsEnum(TransactionEnum)
  type: TransactionEnum;

  @ApiPropertyOptional({
    example: 2,
    description: 'Income group ID (required only if type = income)'
  })
  @ValidateIf(o => o.type === TransactionEnum.INCOME)
  @IsNumber()
  @IsPositive()
  incomeGroupId?: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Expense group ID (required only if type = expense)'
  })
  @ValidateIf(o => o.type === TransactionEnum.EXPENSE)
  @IsNumber()
  @IsPositive()
  expenseGroupId?: number;
}
