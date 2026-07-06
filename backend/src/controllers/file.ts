import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { getUploadPresignedUrl } from "../services/s3-service.js";
import database from "../config/database.js";

export class FileController {
  async getMyFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const files = await database.files.findMany({
        where: { 
          userId: user.id,
          status: "ACTIVE"
        },
        select: {
          name: true,
          size: true,
          format: true,
          createdAt: true,
          lastUpdate: true,
        },
      });

      const pendingFiles = await database.files.count({
        where: { 
          userId: user.id,
          status: "PENDING"
        }
      });

      res.status(200).json({ 
        files, 
        hasProcessingFiles: pendingFiles > 0 
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { fileName, contentType, size } = req.body;
      if (!size || typeof size !== "number") {
        throw new AppError("Tamanho do arquivo é obrigatório!", 400);
      }

      const result = await getUploadPresignedUrl(
        user.id,
        fileName,
        contentType,
      );

      await database.files.create({
        data: {
          name: fileName ? fileName : "",
          format: contentType ? contentType : "",
          status: "PENDING",
          s3Key: result.s3Key,
          userId: user.id,
          size,
        }
      });
      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  }
}
