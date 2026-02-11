import "dotenv/config";
import nodemailer from "nodemailer";
import { Message } from "../types/message.js";

export const sendEmail = (email: string, token: string, reason: string): void => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS_KEY
        }
    });

    const message: Message = {
        from: process.env.EMAIL,
        to: email,
        subject: reason == "confirmation" ? "Confirmação de Email" : "Alteração de Senha",
        html: `<a href="http://localhost:5173/confirmEmail/${token}">${reason == "confirmation" ? "Confirmar Email" : "Alterar Senha"}</a>`
    };

    transporter.sendMail(message, error => {
        if(error) console.log(error);
    });
}