
import * as nodemailer from 'nodemailer';

export class EmailService {
    private static transporter: nodemailer.Transporter;

    public static initialize() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: Number(process.env.EMAIL_PORT) === 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        console.log('Email service initialized');
    }

    public static async sendEmail(to: string, subject: string, html: string) {
        if (!this.transporter) {
            throw new Error('Email service not initialized');
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
} 