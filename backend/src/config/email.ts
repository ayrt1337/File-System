import nodemailer from "nodemailer";

const email = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS_KEY,
  },
});

export default email;