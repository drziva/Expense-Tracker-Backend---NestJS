import { Injectable, NotFoundException } from '@nestjs/common';
import { ExpensesService } from 'src/expenses/expenses.service';
import { IncomesService } from 'src/incomes/incomes.service';
import { GetReportQueryDto } from './dto/get-report-query.dto';
import { ExpenseGroupsService } from 'src/expense-groups/expense-groups.service';
import { IncomeGroupsService } from 'src/income-groups/income-groups.service';
import { ReportResponse } from './dto/reports-returns.dto';
import { renderReportTemplate } from './templates/report.template';
import * as puppeteer from "puppeteer";

@Injectable()
export class ReportsService {
    constructor(
        private expensesService: ExpensesService,
        private incomesService: IncomesService,
        private expenseGroupsService: ExpenseGroupsService,
        private incomeGroupsService: IncomeGroupsService
    ) {}

    async getReport(userId: number, options: GetReportQueryDto): Promise<ReportResponse> {
        const {from, to} = options;
        const expenses = await this.expensesService.getForReport(userId, from, to);
        const incomes = await this.incomesService.getForReport(userId, from, to);

        if(expenses.length === 0 && incomes.length === 0){
            throw new NotFoundException("There aren't any incomes or expenses for generating the report")
        }

        const totalIncomes = this.sum(incomes);
        const totalExpenses = this.sum(expenses);

        const balance = totalIncomes - totalExpenses;

        const expenseGroupNames: Record<number,string> = await this.expenseGroupsService.getGroupsForUser(userId);
        const incomeGroupNames: Record<number,string> = await this.incomeGroupsService.getGroupsForUser(userId);

        const incomesByGroup = this.sumByGroup(incomes, incomeGroupNames);
        const expensesByGroup = this.sumByGroup(expenses, expenseGroupNames);

        return {
            totalIncomes: totalIncomes,
            totalExpenses: totalExpenses,
            balance: balance,
            incomes: incomes,
            expenses: expenses,
            expensesByGroup: expensesByGroup,
            incomesByGroup: incomesByGroup
        }
    }

    async generatePdfReport(
        userId: number,
        options: GetReportQueryDto
    ): Promise<Buffer> {
        const report: ReportResponse = await this.getReport(userId, options);
        const html = renderReportTemplate(report);
        const pdf = await this.htmlToPdf(html);

        return pdf;
    }

    private sum(items: {amount: number}[]): number {
        return items.reduce((sum,item) => sum + Number(item.amount), 0);
    }

    private sumByGroup(
        items: {amount:number, group_id: number}[],
        groupNames: Record<number,string> 
    ): Record<string,number> {
        const result: Record<string,number> = {};

        for(const item of items){
            const name = groupNames[item.group_id]
            if(!result[name]) {
                result[name] = 0;
            }
            result[name] += Number(item.amount);
        }
        return result
    }

    private async htmlToPdf(html: string): Promise<Buffer> {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });

            const page = await browser.newPage();

            await page.setContent(html, {
                waitUntil: "networkidle0",
            });

            const pdfUint8 = await page.pdf({
                format: "A4",
                printBackground: true,
                margin: {
                    top: "20px",
                    bottom: "20px",
                    left: "20px",
                    right: "20px",
                },
            });

            return Buffer.from(pdfUint8);
        } 
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }


}
