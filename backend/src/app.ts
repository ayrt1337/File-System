import "dotenv/config";
import express from "express";
import cors from "cors";
import database from "./config/database.js";
import { v4 as uuidv4 } from "uuid";
import cookieParser from "cookie-parser"
import * as services from "./services/index.js";

const options = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
};

const app = express();

app.use(express.json());
app.use(cors(options));
app.use(cookieParser());

app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await database.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            const newPassword = await services.hashData(password);
            const token = services.genToken();
            services.sendEmail(email, token, "confirmation");

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
        console.log("Erro no envio do email: ", error.message);
        res.status(200).json("success");
    }
})

app.post("/login", async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        const cookie = req.cookies.sessionId;

        const user = await database.user.findUnique({
            where: { email: email },
            select: { password: true, id: true }
        });

        if (!user || !await services.compareHash(password, user.password)) {
            res.status(404).json("fail");
        }

        if (cookie) {
            await services.deleteCookie(cookie, user.id);
        }

        const maxAge = rememberMe == true ? 3600000 * 8766 : null;
        const sessionKey = uuidv4();
        const hashSessionKey = await services.hashData(sessionKey);

        await database.cookie.create({
            data: {
                userId: user.id,
                cookie: hashSessionKey
            }
        });

        res.cookie("sessionId", sessionKey + user.id, { maxAge });
        res.status(200).json("success");
    } catch (error) {
        console.log("Erro no login: ", error.message);
        res.status(200).json("fail");
    }
})

app.post("/reset", async (req, res) => {
    try {
        const { email } = req.body;

        const user = await database.user.findUnique({
            where: { email: email }
        });

        if (user) {
            const token = services.genToken();
            services.sendEmail(email, token, "reset");

            await database.token.create({
                data: {
                    email: email,
                    token: token
                }
            });
        }

        res.status(200).json("success");
    } catch (error) {
        console.log("Erro no envio do email: ", error.message);
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

        user.password = await services.hashData(password);

        await services.updateAccout(user);

        await database.token.deleteMany({
            where: { email: user.email }
        });

        res.status(200).json("success");
    } catch (error) {
        console.log("Erro na alteração de senha: ", error.message);
        res.status(200).json("fail");
    }
})

app.get("/confirmEmail/:token", async (req, res) => {
    try {
        const { token } = req.params;

        if (!services.verifyToken(token)) {
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

        if (!user) {
            res.status(200).json("fail");
        }

        if (user.password) {
            await database.token.deleteMany({
                where: { email: user.email }
            });
            await services.createAccout(user.email, user.password);
        }

        res.status(200).json("success");
    } catch (error) {
        console.log("Erro na verificação de token: ", error.message);
        res.status(200).json("fail");
    }
})

app.get("/session", async (req, res) => {
    const sessionKey = req.cookies.sessionKey;
    const cookie = sessionKey.substring(0, sessionKey.length - 2);
    const userId = Number(sessionKey[sessionKey.length - 1]);

    const user = await services.verifyCookie(cookie, userId);

    if(user){
        res.status(200).json({ user });
    }
    
    res.status(200).json("fail");
})

app.listen(process.env.PORT, () => console.log(`Server Started at ${process.env.PORT}`))