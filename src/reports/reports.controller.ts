import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { UserId } from 'src/auth/user-id.decorator';
import { GetReportQueryDto } from './dto/get-report-query.dto';
import { EmailReportResponse, ReportResponse } from './dto/reports-responses.dto';
import { GetExpensesQueryDto } from 'src/expenses/dto/get-expenses-query.dto';
import { ExpensesService } from 'src/expenses/expenses.service';
import { IncomesService } from 'src/incomes/incomes.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
        private readonly expensesService: ExpensesService,
        private readonly incomesService: IncomesService
    ) {}

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
    ): Promise<EmailReportResponse> {
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
    ): Promise<void> {
        const pdf = await this.reportsService.generatePdfReport(userId, query);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=report_${this.reportsService.timestamp()}.pdf`,
            'Access-Control-Expose-Headers': 'Content-Disposition',
        });

        res.send(pdf);
    }

    @Get("expenses/pdf")
    @ApiOperation({ summary: "Export filtered expenses as PDF" })
    async exportExpensesPdf(
        @UserId() userId: number,
        @Query() query: GetExpensesQueryDto,
        @Res() res: Response,
    ): Promise<void> {
        const expenses = await this.expensesService.getFilteredForPdf(userId, query);
        const pdf = await this.reportsService.generateTransactionTablePdf(userId, expenses, "expense", query);

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=expenses.pdf",
        });

        res.send(pdf);
    }

    @Get("incomes/pdf")
    @ApiOperation({ summary: "Export filtered incomes as PDF" })
    async exportIncomesPdf(
        @UserId() userId: number,
        @Query() query: GetExpensesQueryDto,
        @Res() res: Response,
    ): Promise<void> {
        const incomes = await this.incomesService.getFilteredForPdf(userId, query);
        const pdf = await this.reportsService.generateTransactionTablePdf(userId, incomes, "income", query);

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=incomes.pdf",
        });

        res.send(pdf);
    }
}