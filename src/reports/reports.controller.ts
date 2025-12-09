import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
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

    @Get("pdf")
    async getPdf(
    @UserId() userId: number,
    @Query() query: GetReportQueryDto,
    @Res() res: Response,
    ) {
        const pdf = await this.reportsService.generatePdfReport(userId, query);

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=report.pdf",
        });

        res.send(pdf);
    }

}
