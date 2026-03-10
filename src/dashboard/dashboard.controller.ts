import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import { UserId } from "src/auth/user-id.decorator";
import { DashboardResponse } from "./dto/dashboard-responses.dto";

@ApiTags("Dashboard")
@ApiBearerAuth()
@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService
  ) {}

  @ApiOperation({
    summary: "Get dashboard overview",
    description:
      "Returns dashboard data including balance, total incomes, total expenses, and the latest expenses and incomes for the authenticated user.",
  })
  @ApiOkResponse({
    type: DashboardResponse,
    description: "Dashboard data successfully retrieved",
  })
  @Get()
  async getDashboard(@UserId() userId: number): Promise<DashboardResponse> {
    return await this.dashboardService.getDashboard(userId);
  }

  @Get("summary")
  @ApiOperation({
    summary: "Get dashboard timeline summary",
    description:
      "Returns timeline data for the authenticated user, including income and expense amounts for each day within the specified date range.",
  })
  @ApiOkResponse({
    type: [Object],
    description: "Timeline data successfully retrieved",
  })
  async getDashboardSummary(
    @UserId() userId: number,
    @Query("from") from: string,
    @Query("to") to: string
  ): Promise<{ date: string; income: number; expense: number }[]> {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return this.dashboardService.getDashboardSummary(userId, fromDate, toDate);
  }
}
