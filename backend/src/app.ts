import "dotenv/config";
import express from "express";
import cors from "cors";
import database from "./config/database.js";
import { hashPassword } from "./utils/hash-password.js";
import { genToken, verifyToken } from "./services/token.js";
import { sendEmail } from "./services/email-confirmation.js";
import { createAccout } from "./services/create-account.js";
import { updateAccout } from "./services/update-accout.js";

const options = {
    origin: process.env.CORS_ORIGIN
};

const app = express();

app.use(express.json());
app.use(cors(options));

app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await database.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            const newPassword = await hashPassword(password);
            const token = genToken();
            sendEmail(email, token, "confirmation");

            await database.token.create({
                data: {
                    email: email,
                    password: newPassword,
                    token: token
                }
            });
        }

        res.status(200).json("success");
    } catch (error) {
        console.log("Erro no envio do email:", error.message);
        res.status(200).json("success");
    }
})

app.post("/reset", async (req, res) => {
    try {
        const { email } = req.body;

        const user = await database.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            const token = genToken();
            sendEmail(email, token, "reset");

            await database.token.create({
                data: {
                    email: email,
                    token: token
                }
            });
        }

        res.status(200).json("success");
    } catch (error) {
        console.log("Erro no envio do email:", error.message);
        res.status(200).json("success");
    }
})

app.post("/resetPassword/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const userEmail = await database.token.findUnique({
            where: { token: token },
            select: {
                email: true
            }
        });

        const user = await database.user.findUnique({
            where: { email: userEmail.email },
            select: {
                name: true,
                email: true,
                password: true
            }
        });

        user.password = password;

        await updateAccout(user);

        res.status(200).json("success");
    } catch (error) {
        console.log("Erro na alteração de senha: ", error.message);
        res.status(200).json("fail");
    }
})

app.get("/confirmEmail/:token", async (req, res) => {
    try {
        const { token } = req.params;

        if (!verifyToken(token)) {
            res.status(200).json("fail");
        }

        const user = await database.token.findUnique({
            where: {
                token: token
            },
            select: {
                password: true,
                email: true
            }
        });

        if (user.password) {
            await database.token.deleteMany({
                where: { email: user.email }
            });
            await createAccout(user.email, user.password);
        }

        res.status(200).json("success");
    } catch (error) {
        console.log("Erro na verificação de token: ", error.message);
        res.status(200).json("fail");
    }
})

app.listen(3000, () => console.log(`Server Started at ${process.env.PORT}`))