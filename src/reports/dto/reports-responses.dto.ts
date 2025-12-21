import { ApiProperty } from '@nestjs/swagger';
import { TransactionForReport } from './transaction-for-report.dto';

export class ReportResponse {
  @ApiProperty({ example: 2500 })
  totalIncomes: number;

  @ApiProperty({ example: 1800 })
  totalExpenses: number;

  @ApiProperty({ example: 700 })
  balance: number;

  @ApiProperty({ type: () => [TransactionForReport] })
  incomes: TransactionForReport[];

  @ApiProperty({ type: () => [TransactionForReport] })
  expenses: TransactionForReport[];

  from: Date;

  to: Date;

  @ApiProperty({
    description: 'Summary of expenses grouped by group name',
    example: { Food: 320, Transport: 90 },
  })
  expensesByGroup: Record<string, number>;

  @ApiProperty({
    description: 'Summary of incomes grouped by group name',
    example: { Salary: 2000, Freelance: 500 },
  })
  incomesByGroup: Record<string, number>;
}

export class EmailReportResponse {
  success: boolean;
};
