import { Controller, Get } from "@nestjs/common";
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
}
