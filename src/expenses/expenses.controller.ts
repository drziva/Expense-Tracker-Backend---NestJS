import { Controller,Post, Body, Get, Delete, Param, Put, Query } from "@nestjs/common";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { ExpensesService } from "./expenses.service";
import { ExpenseResponse, GetExpenseResponse, UpdateExpenseResponse } from "./expenses.types";
import { UserId } from "src/auth/user-id.decorator";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { Expense } from "./expenses.entity";
import { ParseDatePipe } from "src/common/pipes/parse-date.pipe";
import type { ExpenseSort } from "./expense-sort.type";
import { DeleteExpenseResponse } from "./expenses.types";
import { ApiBearerAuth, ApiOperation,ApiQuery,ApiResponse } from "@nestjs/swagger";


@ApiBearerAuth()
@Controller("expenses")
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: "Get filtered, sorted, paginated list of expenses" })
  @ApiQuery({ name: "from", required: false, description: "Filter start date (YYYY-MM-DD)" })
  @ApiQuery({ name: "to", required: false, description: "Filter end date (YYYY-MM-DD)" })
  @ApiQuery({ name: "min", required: false, description: "Minimum amount" })
  @ApiQuery({ name: "max", required: false, description: "Maximum amount" })
  @ApiQuery({
    name: "sort",
    required: false,
    enum: ["date_asc", "date_desc", "amount_asc", "amount_desc"],
    description: "Sorting rules",
  })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 20 })
  @ApiResponse({ status: 200, description: "Paginated list of expenses returned successfully" })
  async getFiltered(
    @UserId() userId: number,
    @Query("from", ParseDatePipe) from?: Date,
    @Query("to", ParseDatePipe) to?: Date,
    @Query("min") minRaw?: string,
    @Query("max") maxRaw?: string,
    @Query("sort") sort?: ExpenseSort,
    @Query("page") pageRaw?:number,
    @Query("limit") limitRaw?: number,
  ): Promise<GetExpenseResponse> {
    const min = minRaw ? Number(minRaw) : undefined;
    const max = maxRaw ? Number(maxRaw) : undefined;

    const page = pageRaw ? Number(pageRaw) : 1;
    const limit = limitRaw ? Number(limitRaw) : 20;
    
    const pageNum = page > 0 ? page : 1;
    const limitNum = limit > 0 ? limit : 20;

    return this.expensesService.getFilteredExpenses(userId, {from, to, min, max, sort,page: pageNum, limit: limitNum});
  }

  @Get("total")
  @ApiOperation({ summary: "Get the total sum of all expenses for the user" })
  @ApiResponse({ status: 200, description: "Total sum returned successfully" })
  async getTotalExpenses(@UserId() userId: number): Promise<number> {
    return this.expensesService.getTotalExpensesValue(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single expense by ID" })
  @ApiResponse({ status: 200, description: "Expense found" })
  @ApiResponse({ status: 404, description: "Expense not found" })

  async getExpenseById(@Param('id') id: number, @UserId() userId: number): Promise<Expense> {
    return this.expensesService.getExpenseById(+id, userId);
  }

  @Post("add")
  @ApiOperation({ summary: "Create a new expense" })
  @ApiResponse({ status: 201, description: "Expense created successfully" })
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
  @ApiOperation({ summary: "Update an existing expense by ID" })
  @ApiResponse({ status: 200, description: "Expense updated successfully" })
  @ApiResponse({ status: 404, description: "Expense not found" })
  async modifyExpense(
    @Param("id",) id: number,
    @UserId() userId: number,
    @Body() updateExpenseDto: UpdateExpenseDto): Promise<UpdateExpenseResponse> {
      return await this.expensesService.updateExpenseById(+id,userId, updateExpenseDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an expense by ID" })
  @ApiResponse({ status: 200, description: "Expense deleted successfully" })
  @ApiResponse({ status: 404, description: "Expense not found" })
  async deleteExpense(@Param("id") id: number, @UserId() userId: number): Promise<DeleteExpenseResponse> {
    return await this.expensesService.deleteExpenseById(+id,userId);
  }
}
