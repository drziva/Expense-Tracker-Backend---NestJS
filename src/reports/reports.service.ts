import { Injectable, NotFoundException } from '@nestjs/common';
import { ExpensesService } from '../expenses/expenses.service';
import { IncomesService } from '../incomes/incomes.service';
import { GetReportQueryDto } from './dto/get-report-query.dto';
import { ExpenseGroupsService } from '../expense-groups/expense-groups.service';
import { IncomeGroupsService } from '../income-groups/income-groups.service';
import { ReportResponse } from './dto/reports-responses.dto';
import { renderReportTemplate } from './templates/report.template';
import * as puppeteer from "puppeteer";
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { TransactionForReport } from './dto/transaction-for-report.dto';
import { ReminderReport } from './reports.types';
import { renderReminderReportTemplate } from './templates/reminder-report.template';
import { ExpenseResponse } from '../expenses/dto/expenses-responses.dto';
import { IncomeResponse } from '../incomes/dto/incomes-responses.dto';
import { renderTransactionTableTemplate } from './templates/transaction-table.template';

@Injectable()
export class ReportsService {
    constructor(
        private readonly expensesService: ExpensesService,
        private readonly incomesService: IncomesService,
        private readonly expenseGroupsService: ExpenseGroupsService,
        private readonly incomeGroupsService: IncomeGroupsService,
        private readonly emailService: EmailService,
        private readonly usersService: UsersService
    ) {}

    async getReport(userId: number, options: GetReportQueryDto): Promise<ReportResponse> {
        const {from, to} = options;
        const expenses = await this.expensesService.getForReport(userId, from, to);
        const incomes = await this.incomesService.getForReport(userId, from, to);

        if(expenses.length === 0 && incomes.length === 0){
            throw new NotFoundException("No transactions were found for the selected time period")
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
            incomesByGroup: incomesByGroup,
            from: from!,
            to: to!
        }
    }

    async getReminderReport(
        userId: number,
        from: Date,
        to:Date
    ): Promise<ReminderReport> {
        const expenses = await this.expensesService.getForReport(userId,from,to);
        const totalSpent = this.sum(expenses);
        const expenseGroupNames: Record<number,string> = await this.expenseGroupsService.getGroupsForUser(userId);
        const expensesForReport = this.toReportFormat(expenses,expenseGroupNames);
        const expensesTotalsByGroup = this.sumByGroup(expenses,expenseGroupNames);

        const groups = await this.expenseGroupsService.findAll(userId);
        const groupSummary = groups.map(group => {
            const spent = expensesTotalsByGroup[group.name] ?? 0;
            const budget = group.monthly_budget_cap ?? null;
            const difference = budget != null ? budget - spent : null;
            return {
                groupName: group.name,
                budget,
                spent,
                difference,
            };
        });
        return {
            totalSpent: totalSpent,
            expenses: expensesForReport,
            expenseTotals: expensesTotalsByGroup,
            from: from,
            to: to,
            groupSummary
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

    async generateReminderPdf(userId: number, from: Date, to: Date): Promise<Buffer> {
        const data = await this.getReminderReport(userId, from, to);
        const html = renderReminderReportTemplate(data);
        return this.htmlToPdf(html);
    }

    async generateTransactionTablePdf(userId: number, transactions: ExpenseResponse[] | IncomeResponse[], type:string, query: GetReportQueryDto ): Promise<Buffer> {
        const expenseGroupNames: Record<number,string> = await this.expenseGroupsService.getGroupsForUser(userId);
        const incomeGroupNames: Record<number,string> = await this.incomeGroupsService.getGroupsForUser(userId);
        
        const html = renderTransactionTableTemplate(transactions, type, query, type === "expense" ? expenseGroupNames : incomeGroupNames);
        return this.htmlToPdf(html);
    }

    async sendReportEmail(userId: number, options: GetReportQueryDto): Promise<void> {
        const user = (await this.usersService.findById(userId))!;
        const pdf = await this.generatePdfReport(userId, options);

        return this.emailService.sendFinancialReportEmail(user, pdf);
    }

    timestamp(): string {
        return new Date().toISOString().replace(/[:T]/g, '-').slice(0,19);
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
