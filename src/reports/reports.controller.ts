import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { UserId } from 'src/auth/user-id.decorator';
import { GetReportQueryDto } from './dto/get-report-query.dto';
import { ReportResponse } from './reports.types';

@Controller('reports')
export class ReportsController {
    constructor(
        private reportsService: ReportsService
    ) {}

    @Get()
    async getReport(@UserId() userId: number, @Query() query: GetReportQueryDto): Promise<ReportResponse> {
        return this.reportsService.getReport(userId, query);
    }
}
