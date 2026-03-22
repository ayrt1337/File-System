import "dotenv/config";
import express from "express";
import cors from "cors";
import database from "./config/database.js";
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

const publicRoutes = ["/login", "/register", "/reset", "/resetPassword", "/confirmEmail"];

app.use(async (req, res, next) => {
    const isPublic = publicRoutes.some(route => req.path.startsWith(route));
    if (isPublic) {
        return next();
    }

    try {
        const token = req.cookies.sessionId;
        if (!token) {
            return res.status(403).json("Unauthorized");
        }

        const decodedUser = services.verifyToken(token);
        if (!decodedUser) {
            return res.status(403).json("Unauthorized");
        }

        if (typeof decodedUser === "string") {
            return res.status(502).json("Bad Gateway");
        }
        console.log(decodedUser)
        const user = await database.user.findUnique({
            where: { id: decodedUser.user.id }
        });

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

        const user = await database.user.findUnique({
            where: { email: email, inactive: false },
            select: { password: true, id: true }
        });

        if (!user || !await services.compareHash(password, user.password)) {
            res.status(404).json("fail");
            return;
        }

        const maxAge = rememberMe ? 3600000 * 8766 : 3600000 * 24;
        const sessionId = services.genToken({ id: user.id }, maxAge);

        res.cookie("sessionId", sessionId, { maxAge, secure: true, httpOnly: true });
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
            const hashPassword = await services.hashData(password);
            await database.user.update({
                where: { email: decoded.user.email },
                data: { password: hashPassword }
            });

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
                const user = await database.user.upsert({
                    where: { email: decoded.user.email },
                    update: { 
                        name: "Usuário", 
                        inactive: false, 
                        password: decoded.user.password, 
                        lastUpdate: new Date() 
                    },
                    create: { 
                        name: "Usuário", 
                        email: decoded.user.email, 
                        password: decoded.user.password, 
                    }
                });

                if (user) {
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
        res.clearCookie("sessionId");
        res.status(200).json("Internal Server Error");
    } catch (error) {
        console.log("Erro no logout: ", error.message);
        res.status(500).json("Internal Server Error");
    }
})

app.get("/profile", async (req, res) => {
    try {
        const user = (req as any).user;
        res.status(200).json({ email: user.email, name: user.name });
    } catch (error) {
        console.log("Erro em enviar perfil: ", error.message);
        res.status(500).json("Internal Server Error");
    }
})

app.patch("/update", async (req, res) => {
    try {
        const { name } = req.body;
        const user = (req as any).user;

        await database.user.update({
            where: { id: user.id },
            data: { name, lastUpdate: new Date() }
        });

        res.status(200).json("success");
    } catch (error) {
        console.log("Erro em atualizar conta: ", error.message);
        res.status(500).json("Internal Server Error");
    }
})

app.patch("/delete", async (req, res) => {
    try {
        const user = (req as any).user;
        await services.inactiveAccout(user.id);
        res.clearCookie("sessionId");
        res.status(200).json("success");
    } catch (error) {
        console.log("Erro em inativar conta: ", error.message);
        res.status(500).json("Internal Server Error");
    }
})

app.listen(process.env.PORT, () => console.log(`Server Started at ${process.env.PORT}`))