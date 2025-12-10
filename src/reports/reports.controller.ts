import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { UserId } from 'src/auth/user-id.decorator';
import { GetReportQueryDto } from './dto/get-report-query.dto';
import { ReportResponse } from './dto/reports-responses.dto';
import { User } from 'src/users/user.entity';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
    constructor(private reportsService: ReportsService) {}

    @Get()
    @ApiOperation({
        summary: 'Generate a JSON financial report for the specified date range.',
    })
    @ApiOkResponse({
        description: 'Returns a JSON report that includes incomes, expenses, totals, and grouped results.',
        type: ReportResponse
    })
    @ApiResponse({
        status: 404,
        description: 'Thrown if there are no incomes or expenses for the given date range.',
    })
    async getReport(
        @UserId() userId: number,
        @Query() query: GetReportQueryDto
    ): Promise<ReportResponse> {
        return this.reportsService.getReport(userId, query);
    }

    @Get('email')
    @ApiOperation({
    summary: 'Send a financial report PDF to the authenticated user via email.',
    })
    @ApiOkResponse({
    description: 'The report has been generated and sent to the user’s email.',
    schema: {
        type: 'object',
        properties: {
            success: { type: 'boolean', example: true },
        },
    },
    })
    @ApiResponse({
    status: 404,
    description: 'Thrown if the user is not found or no data exists for generating the report.',
    })
    async getEmail(
        @UserId() userId: number,
        @Query() query: GetReportQueryDto
    ) {
        await this.reportsService.sendReportEmail(userId, query);
        return { success: true };
    }

    @Get('pdf')
    @ApiOperation({
        summary: 'Generate a downloadable PDF financial report for the specified date range.',
    })
    @ApiResponse({
        status: 200,
        description: 'A PDF file containing the financial report.',
        content: {
            'application/pdf': {
                schema: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Thrown if there are no incomes or expenses for the given date range.',
    })
    async getPdf(
        @UserId() userId: number,
        @Query() query: GetReportQueryDto,
        @Res() res: Response,
    ) {
        const pdf = await this.reportsService.generatePdfReport(userId, query);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=report.pdf',
        });

        res.send(pdf);
    }
}