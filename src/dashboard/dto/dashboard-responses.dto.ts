import { ApiProperty } from "@nestjs/swagger";
import { ExpenseResponse } from "../../expenses/dto/expenses-responses.dto";
import { IncomeResponse } from "../../incomes/dto/incomes-responses.dto";

export class DashboardResponse {

  @ApiProperty({
    example: 250.75,
    description: "Current balance (total incomes minus total expenses)",
  })
  balance: number;

  @ApiProperty({
    example: 1249.25,
    description: "Sum of all expenses for the user",
  })
  totalExpenses: number;

  @ApiProperty({
    example: 1500.00,
    description: "Sum of all incomes for the user",
  })
  totalIncomes: number;

  @ApiProperty({
    type: [ExpenseResponse],
    description: "Latest expenses sorted by date (limited)",
  })
  expenses: ExpenseResponse[];

  @ApiProperty({
    type: [IncomeResponse],
    description: "Latest incomes sorted by date (limited)",
  })
  incomes: IncomeResponse[];
}
