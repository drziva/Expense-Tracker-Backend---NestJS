import { Injectable, NotFoundException } from '@nestjs/common';
import { ExpensesService } from 'src/expenses/expenses.service';
import { IncomesService } from 'src/incomes/incomes.service';
import { GetReportQueryDto } from './dto/get-report-query.dto';
import { ExpenseGroupsService } from 'src/expense-groups/expense-groups.service';
import { IncomeGroupsService } from 'src/income-groups/income-groups.service';
import { ReportResponse } from './dto/reports-responses.dto';
import { renderReportTemplate } from './templates/report.template';
import * as puppeteer from "puppeteer";
import { EmailService } from 'src/email/email.service';
import { UsersService } from 'src/users/users.service';
import { TransactionForReport } from './dto/transaction-for-report.dto';

@Injectable()
export class ReportsService {
    constructor(
        private expensesService: ExpensesService,
        private incomesService: IncomesService,
        private expenseGroupsService: ExpenseGroupsService,
        private incomeGroupsService: IncomeGroupsService,
        private emailService: EmailService,
        private usersService: UsersService
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

        const incomesForReport: TransactionForReport[] = this.toReportFormat(incomes,incomeGroupNames);
        const expensesForReport: TransactionForReport[] = this.toReportFormat(expenses,expenseGroupNames);

        const incomesByGroup = this.sumByGroup(incomes, incomeGroupNames);
        const expensesByGroup = this.sumByGroup(expenses, expenseGroupNames);

        return {
            totalIncomes: totalIncomes,
            totalExpenses: totalExpenses,
            balance: balance,
            incomes: incomesForReport,
            expenses: expensesForReport,
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

    async sendReportEmail(userId: number, options: GetReportQueryDto): Promise<void> {
        const user = (await this.usersService.findById(userId))!;
        const pdf = await this.generatePdfReport(userId, options);

        return this.emailService.sendFinancialReportEmail(user, pdf);
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

    private toReportFormat(transaction, groupNames): TransactionForReport[] {
        const valuesForReport = transaction.map(transaction=>
        ({
            amount: transaction.amount,
            description: transaction.description,
            created_at:transaction.created_at,
            group: groupNames[transaction.group_id]
        })
        )
        return valuesForReport
    }
}
