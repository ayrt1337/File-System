import jwt from "jsonwebtoken";
import { User } from "../types/user.js";

export const genToken = (user: User, expiresIn: number): string => {
    const token = jwt.sign({
        user: user
    },
        "secret_key", { expiresIn }
    );
    return token;
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, "secret_key");
}

export const decodeToken = (token: string) => {
    return jwt.decode(token);
}