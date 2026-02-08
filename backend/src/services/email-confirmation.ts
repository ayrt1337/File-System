import "dotenv/config";
import nodemailer from "nodemailer";

export const sendEmail = (email: string): void => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS_KEY
        }
    });

    const message = {

    }
}