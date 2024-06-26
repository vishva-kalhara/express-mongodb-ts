import { IUserDocument } from '../types/userTypes';
import nodemailer from 'nodemailer';
import pug from 'pug';
import htmlToText from 'html-to-text';

export default class Email {
    to: string;
    firstName: string;
    url: string;
    from: string;

    constructor(user: IUserDocument, url: string) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`;
    }

    newTransport() {
        return nodemailer.createTransport({
            auth: {
                user: process.env.EMAIL_USER as string,
                pass: process.env.EMAIL_PASSWORD as string,
            },
            host: process.env.EMAIL_HOST as string,
            port: Number(process.env.EMAIL_PORT),
        });
    }

    async send(template: string, subject: string, data = '') {
        const html = pug.renderFile(
            `${__dirname}/../../templates/emails/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject,
                data,
            }
        );

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html),
        };

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset(plainToken: string) {
        await this.send(
            'forgetPassword',
            'Your password reset token (valid for 10 mins)',
            plainToken
        );
    }
}
