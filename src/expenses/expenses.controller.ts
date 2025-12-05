import { Controller,Post, Body, Get, Delete, Param, Put, Query, ParseIntPipe } from "@nestjs/common";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { ExpensesService } from "./expenses.service";
import { DeleteExpenseResponse, ExpenseResponse, GetExpenseResponse, UpdateExpenseResponse } from "./expenses.types";
import { UserId } from "src/auth/user-id.decorator";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { ApiBearerAuth, ApiOperation,ApiResponse } from "@nestjs/swagger";
import { GetExpensesQueryDto } from "./dto/get-expenses-query.dto";


@ApiBearerAuth()
@Controller("expenses")
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: "Get filtered, sorted, paginated list of expenses" })
  @ApiResponse({ status: 200, description: "Paginated list of expenses returned successfully" })
  async getFiltered(
    @UserId() userId: number,
    @Query() query: GetExpensesQueryDto
  ): Promise<GetExpenseResponse> {

    const pageNum = (query.page ?? 0) > 0 ? query.page : 1;
    const limitNum = (query.limit ?? 0) > 0 ? query.limit : 20;

    return this.expensesService.getFilteredExpenses(userId, {from: query.from, to: query.to, min: query.min, max: query.max, sort: query.sort, page: pageNum, limit: limitNum, search: query.search});
  }

  @Get("reports")
  @ApiOperation({ summary: "Get expense reports for the user" })
  async getExpenseReport(
    @UserId() userId: number,
    @Query() query: GetExpensesQueryDto
  ){
    return { message: "Report generation not yet implemented." };
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

  async getExpenseById(@Param('id') id: number, @UserId() userId: number): Promise<ExpenseResponse> {
    return this.expensesService.getExpenseById(+id, userId);
  }

  @Post("add")
  @ApiOperation({ summary: "Create a new expense" })
  @ApiResponse({ status: 201, description: "Expense created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async create(@Body() dto: CreateExpenseDto, @UserId() userId: number): Promise<ExpenseResponse> {
    return await this.expensesService.create(dto, userId);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an existing expense by ID" })
  @ApiResponse({ status: 200, description: "Expense updated successfully" })
  @ApiResponse({ status: 404, description: "Expense not found" })
  async updateExpense(
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
