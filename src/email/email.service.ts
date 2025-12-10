import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/user.entity';

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
            `${user.username}_report.pdf`
        );
    }
}
