import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/user.entity';
import { ExpenseGroup } from 'src/expense-groups/expense-groups.entity.ts';

@Injectable()
export class EmailService {
    private resend: Resend;
    private from: string;

    constructor(private config: ConfigService) {
        const apiKey = this.config.get<string>('email.apiKey');
        this.from = this.config.get<string>('email.from')!;

        if (!apiKey || !this.from) {
            throw new Error('RESEND_API_KEY or EMAIL_FROM is missing');
        }

        this.resend = new Resend(apiKey);
    }

    async send(
        to: string, 
        subject: string, 
        html: string
    ): Promise<void> {
        try {
            await this.resend.emails.send({
            from: this.from,
            to,
            subject,
            html,
            });

        } catch (error) {
            console.error("Error sending email: ", error)
            throw error;
        }
    }

    async sendWithAttachment(
        to: string,
        subject: string,
        html: string,
        pdfBuffer: Buffer,
        filename: string,
    ): Promise<void> {
        try {
            await this.resend.emails.send({
            from: this.from,
            to,
            subject,
            html,
            attachments: [
                {
                filename,
                content: pdfBuffer.toString('base64'),
                },
            ],
            });
        } catch (error) {
            console.error("Error sending email with attachment: ", error)
            throw error;
        }
    }

    async sendFinancialReportEmail(
        user: User,
        pdf: Buffer
    ): Promise<void> {
        const subject = "Your Financial Report -- VegaIT";

        const html = `
            <h1>Hi, ${user.username}!</h1>
            <h2>Your financial report is ready</h2>
            <p>See the attached PDF for more details.</p>
        `;

        return this.sendWithAttachment(
            user.email,
            subject,
            html,
            pdf,
            `${user.username}_report_${this.timestamp()}.pdf`
        );
    }

    async sendReminderReportEmail(
        user: User,
        pdf: Buffer
    ): Promise<void> {
        const subject = "Your recurring spending report";

        const html = `
            <h1>Hi, ${user.username}!</h1>
            <h2>Your reccuring spending report is ready</h2>
            <p>See the attached PDF for more details.</p>
        `;

        return this.sendWithAttachment(
            user.email,
            subject,
            html,
            pdf,
            `${user.username}_report_${this.timestamp()}.pdf`
        );
    }

    async sendBudgetCapAlert(
        user: User,
        group: ExpenseGroup,
        totalAfter: number
    ): Promise<void> {
        const subject = "Budget cap exceeded";

        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #d9534f;">Budget Cap Exceeded</h2>
                <p>Hi ${user.username},</p>

                <p>
                    You've exceeded the monthly budget cap for the 
                    <strong>${group.name}</strong> group.
                </p>

                <p>
                    <strong>Budget cap:</strong> ${group.monthly_budget_cap} €<br/>
                    <strong>Current total:</strong> ${totalAfter.toFixed(2)} €
                </p>

                <p>
                    Consider reviewing your recent expenses or adjusting your budget 
                    to stay on track for the rest of the month.
                </p>

                <p style="margin-top: 30px; color: #6c757d;">
                    This is an automated notification from your VegaIT Expense Tracker.
                </p>
            </div>
        `;
        return this.send(user.email,subject,html);
    }

    private timestamp(): string {
        return new Date().toISOString().replace(/[:T]/g, '-').slice(0,19);
    }
}
