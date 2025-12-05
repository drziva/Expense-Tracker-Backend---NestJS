import { Controller,Post, Body, Get, Delete, Param, Put, Query, ParseFloatPipe} from "@nestjs/common";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { ExpensesService } from "./expenses.service";
import { ExpenseResponse } from "./expense.types";
import { UserId } from "src/auth/user-id.decorator";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { Expense } from "./expenses.entity";
import { ParseDatePipe } from "src/common/pipes/parse-date.pipe";

@Controller("expenses")
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  async getFiltered(
    @UserId() userId: number,
    @Query("from", ParseDatePipe) from?: Date,
    @Query("to", ParseDatePipe) to?: Date,
    @Query("min") min?: string,
    @Query("max") max?: string): Promise<Expense[]> {
    return this.expensesService.getFilteredExpenses(userId, from, to, min, max);
  }

  @Get("total")
  async getTotalExpenses(@UserId() userId: number): Promise<number> {
    return this.expensesService.getTotalExpensesValue(userId);
  }

  @Get(":id")
  async getExpenseById(@Param('id') id: number, @UserId() userId: number): Promise<Expense> {
    return this.expensesService.getExpenseById(+id, userId);
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
    @Body() updateExpenseDto: UpdateExpenseDto): Promise<string> {
      const res = await this.expensesService.updateExpenseById(+id,userId, updateExpenseDto);

    return res ? `Expense with id ${id} updated successfully` : `Expense with id ${id} not found`;
  }

  @Delete(":id")
  async deleteExpense(@Param("id") id: number, @UserId() userId: number): Promise<string> {
    const res = await this.expensesService.deleteExpenseById(+id,userId);

    return res ? `Expense with id:${id} deleted successfully` : `Expense with id:${id} not found`;
  }
}
