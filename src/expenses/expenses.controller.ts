import { Controller,Post, Body, Get, Delete, Param, Put } from "@nestjs/common";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { ExpensesService } from "./expenses.service";
import { ExpenseResponse } from "./expense.types";
import { UserId } from "src/auth/user-id.decorator";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { Expense } from "./expenses.entity";

@Controller("expenses")
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('all')
  async getExpenses(@UserId() userId: number): Promise<Expense[]> {
    return this.expensesService.getAllExpenses(userId);
  }

  @Post("add")
  async create(@Body() dto: CreateExpenseDto, @UserId() userId: number): Promise<ExpenseResponse> {
    const saved = await this.expensesService.create(dto, userId);

    return {
        id: saved.id,
        amount: saved.amount,
        description: saved.description,
        createdAt: saved.created_at,
    }
  }

  @Put(":id")
  async modifyExpense(
    @Param("id",) id: number,
    @UserId() userId: number,
    @Body() updateExpenseDto: UpdateExpenseDto): Promise<boolean> {
      return await this.expensesService.updateExpenseById(+id,userId, updateExpenseDto);
  }

  @Delete(":id")
  async deleteExpense(@Param("id") id: number, @UserId() userId: number): Promise<boolean> {
    return await this.expensesService.deleteExpenseById(+id,userId);
  }
}
