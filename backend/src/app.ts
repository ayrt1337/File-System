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

app.use(async (req, res, next) => {
    try {
        await services.expireCookie();
        next();
    } catch (error) {
        console.log("Erro na expiração de cookies: ", error.message);
        res.status(500).json("Internal Server Error");
    }
})

const publicRoutes = ["/login", "/register", "/reset", "/resetPassword", "/confirmEmail"];

app.use(async (req, res, next) => {
    const isPublic = publicRoutes.some(route => req.path.startsWith(route));
    if (isPublic) {
        return next();
    }

    try {
        const sessionKey = req.cookies.sessionId;

        if (!sessionKey) {
            return res.status(403).json("Unauthorized");
        }

        const user = await services.verifySession(sessionKey);
        if (!user) {
            return res.status(403).json("Unauthorized");
        }

        (req as any).user = user;
        next();
    } catch (error) {
        console.log("Erro no middleware de autenticação: ", error.message);
        res.status(500).json("Internal Server Error");
    }
})

app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await database.user.findUnique({
            where: { email: email }
        });

        if (!user || user.inactive) {
            const newPassword = await services.hashData(password);
            const token = services.genToken({
                email: email,
                password: newPassword
            }, 600);
            services.sendEmail(email, token, "confirmation");
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
        const sessionId = req.cookies.sessionId;
        const cookie = sessionId?.substring(0, sessionId?.length - 1);

        const user = await database.user.findUnique({
            where: { email: email, inactive: false },
            select: { password: true, id: true }
        });

        if (!user || !await services.compareHash(password, user.password)) {
            res.status(404).json("fail");
            return;
        }

        if (cookie) {
            await services.deleteCookie(cookie, user.id);
        }

        const maxAge = rememberMe ? 3600000 * 8766 : 3600000 * 24;
        const sessionKey = uuidv4();
        const hashSessionKey = await services.hashData(sessionKey);

        await database.cookie.create({
            data: {
                userId: user.id,
                cookie: hashSessionKey,
                maxAge: new Date(Date.now() + maxAge),
                createdAt: new Date()
            }
        });

        res.cookie("sessionId", sessionKey + user.id, { maxAge, secure: true, httpOnly: true });
        res.status(200).json("success");
    } catch (error) {
        console.log("Erro no login: ", error.message);
        res.status(500).json("Internal Server Error");
    }
})

app.post("/reset", async (req, res) => {
    try {
        const { email } = req.body;

        const user = await database.user.findUnique({
            where: { email: email }
        });

        if (user) {
            const token = services.genToken({ email }, 600);
            services.sendEmail(email, token, "reset");
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

        const decoded = services.decodeToken(token);

        if (typeof decoded !== 'string') {
            const user = await database.user.findUnique({
                where: { email: decoded.user.email },
                select: {
                    id: true,
                    password: true
                }
            });

            user.password = await services.hashData(password);
            await services.updateAccout(user);
            res.status(200).json("success");
            return;
        }

        res.status(502).json("Bad Gateway");
    } catch (error) {
        console.log("Erro na alteração de senha: ", error.message);
        res.status(500).json("Internal Server Error");
    }
})

app.get("/confirmEmail/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = services.verifyToken(token);

        if (!decoded) {
            res.status(400).json("Bad Request");
            return;
        }

        if (typeof decoded !== 'string') {
            if (!decoded.user.password) {
                res.status(200).json("success");
                return;
            }

            else {
                const user = await database.user.findUnique({
                    where: { email: decoded.user.email },
                    select: { name: true, lastUpdate: true, password: true, inactive: true }
                });

                if (!user) {
                    await services.createAccout(decoded.user.email, decoded.user.password);
                    res.status(200).json("success");
                    return;
                }

                else if (user.inactive) {
                    user.name = "Usuário";
                    user.password = decoded.user.password;
                    user.lastUpdate = new Date();
                    user.inactive = false;

                    await services.updateAccout(user);
                    res.status(200).json("success");
                    return;
                }

                else {
                    res.status(400).json("Bad Request");
                    return;
                }
            }
        }

        res.status(502).json("Bad Gateway");
    } catch (error) {
        console.log("Erro na verificação de token: ", error.message);
        res.status(500).json("Internal Server Error");
    }
})

app.get("/my-files", async (req, res) => {
    const user = (req as any).user;
    res.status(200).json({ name: user.name });
})

app.get("/logout", async (req, res) => {
    try {
        const sessionKey = req.cookies.sessionId;
        const cookie = sessionKey.substring(0, sessionKey.length - 1);
        const user = (req as any).user;

        await services.deleteCookie(cookie, user.id);
        res.clearCookie("sessionId");
        res.status(200).json("success");
    } catch (error) {
        console.log("Erro no logout: ", error.message);
        res.status(500).json("Internal Server Error");
    }
})

app.get("/profile", async (req, res) => {
    const user = (req as any).user;
    res.status(200).json({ email: user.email, name: user.name });
})

app.listen(process.env.PORT, () => console.log(`Server Started at ${process.env.PORT}`))