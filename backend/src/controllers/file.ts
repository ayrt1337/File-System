import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { getUploadPresignedUrl } from "../services/s3-service.js";
import database from "../config/database.js";

export class FileController {
    async getMyFiles(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const files = await database.files.findMany({
                where: { userId: user.id }
            });
            res.status(200).json({ files });
        } catch (error: any) {
            next(error);
        }
    }

    async getUploadUrl(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const { fileName, contentType } = req.body;
            if (!fileName || !contentType) {
                throw new AppError("fileName e contentType são obrigatórios!", 400);
            }
            const result = await getUploadPresignedUrl(user.id, fileName, contentType);
            res.status(200).json(result);
        } catch (error: any) {
            next(error);
        }
    }
}
