import { Request, Response, NextFunction } from "express";
import database from "../config/database.js";
import { verifyToken } from "../services/token.js";
import { AppError } from "../errors/app-error.js";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.sessionId;
        if (!token) {
            throw new AppError("Unauthorized", 401);
        }

        const decodedUser = verifyToken(token) as { id: string };
        if (!decodedUser) {
            throw new AppError("Unauthorized", 401);
        }

        const user = await database.user.findUnique({
            where: { id: decodedUser.id }
        });

        if (!user) {
            throw new AppError("Unauthorized", 403);
        }

        (req as any).user = user;
        next();
    } catch (error: any) {
        next(error);
    }
};
