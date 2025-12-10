import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

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
            throw new InternalServerErrorException('Failed to send email');
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
            throw new InternalServerErrorException('Failed to send email with attachment');
        }
    }

}
