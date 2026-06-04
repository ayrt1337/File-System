import "dotenv/config";
import email from "../config/email.js";

interface SendEmailOptions {
    to: string;
    subject: string;
    html?: string;
    path?: string;
    token?: string;
}

interface Message {
    from: string,
    to: string,
    subject: string,
    html: string
};

export const sendEmail = ({ to, subject, html, path, token }: SendEmailOptions): void => {
    const clientUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
    const emailHtml = html || `<a href="${clientUrl}/${path}/${token}">${subject}</a>`;

    const message: Message = {
        from: process.env.EMAIL || "",
        to,
        subject,
        html: emailHtml
    };

    email.sendMail(message, error => {
        if (error) console.error(error);
    });
}