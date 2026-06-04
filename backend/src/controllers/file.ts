import { Request, Response, NextFunction } from "express";

export class FileController {
    async getMyFiles(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            res.status(200).json({ name: user.name });
        } catch (error: any) {
            next(error);
        }
    }
}
