import "dotenv/config";
import express from "express";
import cors from "cors";
import database from "./config/database.js";
import { User } from "./types/user.js";
import { hashPassword } from "./utils/hash-password.js";

const options = {
    origin: process.env.CORS_ORIGIN
};

const app = express();

app.use(express.json());
app.use(cors(options));

app.post("/register", async (req, res) => {
    try {
        const password = await hashPassword(req.body.password);

        const user: User = {
            name: "",
            email: req.body.email,
            password: password
        };

        await database.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: user.password
            }
        });

        res.status(200).json("success");
    }
    catch (error) {
        console.log(error);
        res.status(200).json("fail");
    }
})

app.listen(3000, () => console.log(`Server Started at ${process.env.PORT}`))