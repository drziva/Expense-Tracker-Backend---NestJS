import { ApiProperty } from '@nestjs/swagger';
import { Expense } from 'src/expenses/expenses.entity';
import { Income } from 'src/incomes/incomes.entity';

export class ReportResponse {
  @ApiProperty({ example: 2500 })
  totalIncomes: number;

  @ApiProperty({ example: 1800 })
  totalExpenses: number;

  @ApiProperty({ example: 700 })
  balance: number;

  @ApiProperty({ type: () => [Income] })
  incomes: Income[];

  @ApiProperty({ type: () => [Expense] })
  expenses: Expense[];

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
