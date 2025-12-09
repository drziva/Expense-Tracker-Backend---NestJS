import { Controller, Post, Body, Get, Delete, Param, Put, Query, ParseIntPipe } from "@nestjs/common";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { ExpensesService } from "./expenses.service";
import { DeleteExpenseResponse, ExpenseResponse, GetExpenseResponse } from "./dto/expenses-returns.dto";
import { UserId } from "src/auth/user-id.decorator";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiOkResponse, ApiCreatedResponse } from "@nestjs/swagger";
import { GetExpensesQueryDto } from "./dto/get-expenses-query.dto";

@ApiBearerAuth()
@Controller("expenses")
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: "Get filtered, sorted, paginated list of expenses" })
  @ApiOkResponse({ 
    description: "Paginated list of expenses returned successfully",
    type: GetExpenseResponse
  })
  async getFiltered(
    @UserId() userId: number,
    @Query() query: GetExpensesQueryDto
  ): Promise<GetExpenseResponse> {

    const pageNum = (query.page ?? 0) > 0 ? query.page : 1;
    const limitNum = (query.limit ?? 0) > 0 ? query.limit : 20;

    const { page, limit, ...rest } = query;

    return this.expensesService.getFilteredExpenses(
      userId, 
      { ...rest, page: pageNum, limit: limitNum }
    );
  }

  @Get("total")
  @ApiOperation({ summary: "Get the total sum of all expenses for the user" })
  @ApiOkResponse({
    description: "Total sum returned successfully",
    schema: { example: 1234.56, type: 'number' }
  })
  async getTotalExpenses(@UserId() userId: number): Promise<number> {
    return this.expensesService.getTotalExpensesValue(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single expense by ID" })
  @ApiOkResponse({
    description: "Expense found",
    type: ExpenseResponse
  })
  @ApiResponse({ status: 404, description: "Expense not found" })
  async getExpenseById(
    @Param('id', ParseIntPipe) id: number, 
    @UserId() userId: number
  ): Promise<ExpenseResponse> {
    return this.expensesService.getExpenseById(id, userId);
  }

  @Post("add")
  @ApiOperation({ summary: "Create a new expense" })
  @ApiCreatedResponse({
    description: "Expense created successfully",
    type: ExpenseResponse
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async create(
    @Body() dto: CreateExpenseDto, 
    @UserId() userId: number
  ): Promise<ExpenseResponse> {
    return await this.expensesService.create(dto, userId);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an existing expense by ID" })
  @ApiOkResponse({
    description: "Expense updated successfully",
    type: ExpenseResponse
  })
  @ApiResponse({ status: 404, description: "Expense not found" })
  async updateExpense(
    @Param("id", ParseIntPipe) id: number,
    @UserId() userId: number,
    @Body() updateExpenseDto: UpdateExpenseDto
  ): Promise<ExpenseResponse> {
      return await this.expensesService.updateExpenseById(id, userId, updateExpenseDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an expense by ID" })
  @ApiOkResponse({
    description: "Expense deleted successfully",
    type: DeleteExpenseResponse
  })
  @ApiResponse({ status: 404, description: "Expense not found" })
  async deleteExpense(
    @Param("id", ParseIntPipe) id: number, 
    @UserId() userId: number
  ): Promise<DeleteExpenseResponse> {
    return await this.expensesService.deleteExpenseById(id, userId);
  }
}
