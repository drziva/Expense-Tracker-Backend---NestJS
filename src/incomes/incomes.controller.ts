import { 
  Controller, Post, Body, Get, Delete, Param, ParseIntPipe, Put, Query 
} from "@nestjs/common";
import { CreateIncomeDto } from "./dto/create-income.dto";
import { IncomesService } from "./incomes.service";
import { DeleteIncomeResponse, IncomeResponse, GetIncomeResponse } from "./dto/incomes-responses.dto";
import { UserId } from "src/auth/user-id.decorator";
import { UpdateIncomeDto } from "./dto/update-income.dto";
import { 
  ApiBearerAuth, 
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiCreatedResponse
} from "@nestjs/swagger";
import { GetIncomesQueryDto } from "./dto/get-incomes-query.dto";

@ApiBearerAuth()
@Controller("incomes")
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Get()
  @ApiOperation({ summary: "Get filtered, sorted, paginated list of incomes" })
  @ApiOkResponse({
    description: "Paginated list of incomes returned successfully.",
    type: GetIncomeResponse
  })
  async getFiltered(
    @UserId() userId: number,
    @Query() query: GetIncomesQueryDto
  ): Promise<GetIncomeResponse> {

    const pageNum = (query.page ?? 0) > 0 ? query.page : 1;
    const limitNum = (query.limit ?? 0) > 0 ? query.limit : 20;

    const { page, limit, ...rest } = query;

    return this.incomesService.getFilteredIncomes(userId, {
      ...rest,
      page: pageNum,
      limit: limitNum,
    });
  }

  @Get("total")
  @ApiOperation({ summary: "Get the total sum of all incomes for the user" })
  @ApiOkResponse({
    description: "Total sum returned successfully",
    schema: { type: "number", example: 3250 }
  })
  async getTotalIncomes(@UserId() userId: number): Promise<number> {
    return this.incomesService.getTotalIncomesValue(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single income by ID" })
  @ApiOkResponse({
    description: "Income found",
    type: IncomeResponse
  })
  @ApiResponse({ status: 404, description: "Income not found" })
  async getIncomeById(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number
  ): Promise<IncomeResponse> {
    return this.incomesService.getIncomeById(id, userId);
  }

  @Post("add")
  @ApiOperation({ summary: "Create a new income" })
  @ApiCreatedResponse({
    description: "Income created successfully",
    type: IncomeResponse
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async create(
    @Body() dto: CreateIncomeDto,
    @UserId() userId: number
  ): Promise<IncomeResponse> {
    return await this.incomesService.create(dto, userId);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an existing income by ID" })
  @ApiOkResponse({
    description: "Income updated successfully",
    type: IncomeResponse
  })
  @ApiResponse({ status: 404, description: "Income not found" })
  async updateIncome(
    @Param("id", ParseIntPipe) id: number,
    @UserId() userId: number,
    @Body() updateIncomeDto: UpdateIncomeDto
  ): Promise<IncomeResponse> {
    return await this.incomesService.updateIncomeById(id, userId, updateIncomeDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an income by ID" })
  @ApiOkResponse({
    description: "Income deleted successfully",
    type: DeleteIncomeResponse
  })
  @ApiResponse({ status: 404, description: "Income not found" })
  async deleteIncome(
    @Param("id", ParseIntPipe) id: number,
    @UserId() userId: number
  ): Promise<DeleteIncomeResponse> {
    return await this.incomesService.deleteIncomeById(id, userId);
  }
}
