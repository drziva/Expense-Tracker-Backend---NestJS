import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { ExpenseGroup } from '../expense-groups/expense-groups.entity';

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
           <div style="
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background: linear-gradient(180deg, #f5f6fa 0%, #eef0f5 100%);
                padding: 48px 20px;
                ">
                <div style="
                    max-width: 560px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    padding: 40px;
                    box-shadow: 0 20px 40px rgba(17,24,39,0.08);
                ">
                    <h2 style="
                    margin: 0 0 20px;
                    font-size: 22px;
                    font-weight: 600;
                    color: #111827;
                    letter-spacing: -0.02em;
                    ">
                    Budget limit exceeded
                    </h2>

                    <p style="
                    margin: 0 0 14px;
                    font-size: 15px;
                    color: #374151;
                    line-height: 1.65;
                    ">
                    Hi <strong>${user.username}</strong>,
                    </p>

                    <p style="
                    margin: 0 0 26px;
                    font-size: 15px;
                    color: #374151;
                    line-height: 1.65;
                    ">
                    Your spending in the <strong>${group.name}</strong> category has gone beyond
                    the monthly budget limit you set.
                    </p>

                    <div style="
                    background-color: #f9fafb;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 28px;
                    ">
                    <div style="margin-bottom: 14px;">
                        <p style="
                        margin: 0;
                        font-size: 13px;
                        color: #6b7280;
                        text-transform: uppercase;
                        letter-spacing: 0.04em;
                        ">
                        Budget limit
                        </p>
                        <p style="
                        margin: 4px 0 0;
                        font-size: 18px;
                        font-weight: 600;
                        color: #111827;
                        ">
                        ${group.monthly_budget_cap} €
                        </p>
                    </div>

                    <div>
                        <p style="
                        margin: 0;
                        font-size: 13px;
                        color: #6b7280;
                        text-transform: uppercase;
                        letter-spacing: 0.04em;
                        ">
                        Current total
                        </p>
                        <p style="
                        margin: 4px 0 0;
                        font-size: 18px;
                        font-weight: 600;
                        color: #111827;
                        ">
                        ${totalAfter.toFixed(2)} €
                        </p>
                    </div>
                    </div>

                    <p style="
                    margin: 0 0 32px;
                    font-size: 15px;
                    color: #374151;
                    line-height: 1.65;
                    ">
                    Reviewing recent expenses or adjusting your budget now can help you stay in
                    control for the rest of the month.
                    </p>

                    <div style="
                    text-align: center;
                    padding-top: 24px;
                    border-top: 1px solid #e5e7eb;
                    ">
                    <p style="
                        margin: 0;
                        font-size: 12px;
                        color: #9ca3af;
                    ">
                        Automated notification · VegaIT Expense Tracker
                    </p>
                    </div>
                </div>
                </div>
        `;
        return this.send(user.email,subject,html);
    }

    private timestamp(): string {
        return new Date().toISOString().replace(/[:T]/g, '-').slice(0,19);
    }
}
