import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import {
  getUploadPresignedUrl,
  getDownloadPresignedUrl,
  getPreviewPresignedUrl,
  getTotalUserFiles,
} from "../services/s3-service.js";
import database from "../config/database.js";
import { FileStatus } from "../types/file.js";
import { PARAMS } from "../routing/routes.js";

export class FileController {
  async getMyFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { status, isFavorite } = req.query as {
        status?: string;
        isFavorite?: string;
      };

      let targetStatus: FileStatus = "ACTIVE";
      if (status) {
        const upperStatus = status.toUpperCase();
        if (upperStatus !== "ACTIVE" && upperStatus !== "TRASH") {
          throw new AppError("Status de arquivo inválido!", 400);
        }
        targetStatus = upperStatus as FileStatus;
      }

      const showOnlyFavorites = isFavorite === "true";
      if (showOnlyFavorites) {
        targetStatus = "ACTIVE";
      }

      const files = await database.files.findMany({
        where: {
          userId: user.id,
          status: targetStatus,
          isFavorite: showOnlyFavorites ? true : undefined,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          size: true,
          format: true,
          preview: true,
          isFavorite: true,
          createdAt: true,
          lastUpdate: true,
        },
      });

      const databaseUserFiles = await database.files.count({
        where: {
          userId: user.id
        },
      });

      const s3UserFiles = await getTotalUserFiles(user.id);

      const filesWithPreviews = await Promise.all(
        files.map(async (file) => {
          let signedPreviewUrl = null;
          if (file.preview) {
            try {
              signedPreviewUrl = await getPreviewPresignedUrl(file.preview);
            } catch (err) {
              console.error(`Erro ao gerar URL do preview para ${file.preview}:`, err);
            }
          }
          return {
            ...file,
            preview: signedPreviewUrl,
          };
        })
      );

      res.status(200).json({
        files: filesWithPreviews,
        hasProcessingFiles: s3UserFiles > databaseUserFiles,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { fileName, contentType, size, preview } = req.body;
      if (!size || typeof size !== "number") {
        throw new AppError("Tamanho do arquivo é obrigatório!", 400);
      }

      const result = await getUploadPresignedUrl(
        user.id,
        fileName,
        contentType,
        !!preview
      );

      res.status(200).json({
        url: result.url,
        previewUrl: result.previewUrl
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getDownloadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const id = req.params[PARAMS.ID] as string;
      if (!id) {
        throw new AppError("ID do arquivo é obrigatório!", 400);
      }

      const file = await database.files.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!file) {
        throw new AppError("Arquivo não encontrado!", 404);
      }

      if (file.status !== "ACTIVE") {
        throw new AppError(
          "Só é possível fazer download de arquivos ativos!",
          400,
        );
      }

      const url = await getDownloadPresignedUrl(file.s3Key, file.name);
      res.status(200).json({ url });
    } catch (error: any) {
      next(error);
    }
  }

  async renameFile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { fileId, newName } = req.body as {
        fileId: string;
        newName: string;
      };

      if (!newName) {
        throw new AppError("O nome do arquivo não pode ser vazio!", 400);
      }

      const file = await database.files.findFirst({
        where: {
          id: fileId,
          userId: user.id,
        },
      });

      if (!file) {
        throw new AppError("Arquivo não encontrado!", 404);
      }

      if (file.status !== "ACTIVE") {
        throw new AppError("Só é possível renomear arquivos ativos!", 400);
      }

      await database.files.update({
        where: {
          id: fileId,
          userId: user.id,
        },
        data: {
          name: newName,
          lastUpdate: new Date(),
        },
      });

      res.status(200).json("success");
    } catch (error) {
      next(error);
    }
  }

  async updateFileStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { fileId, status } = req.body as {
        fileId: string;
        status: FileStatus;
      };

      if (status !== "ACTIVE" && status !== "TRASH") {
        throw new AppError("Status de arquivo inválido!", 400);
      }

      const file = await database.files.findFirst({
        where: {
          id: fileId,
          userId: user.id,
        },
      });

      if (!file) {
        throw new AppError("Arquivo não encontrado!", 404);
      }

      if (status === "ACTIVE" && file.status !== "TRASH") {
        throw new AppError(
          "Só é possível restaurar um arquivo que está na lixeira!",
          400,
        );
      }

      if (status === "TRASH" && file.status !== "ACTIVE") {
        throw new AppError(
          "Só é possível mover para a lixeira arquivos ativos!",
          400,
        );
      }

      await database.files.update({
        where: {
          id: fileId,
          userId: user.id,
        },
        data: {
          status: status,
          isFavorite: status === "TRASH" ? false : undefined,
          lastUpdate: new Date(),
        },
      });

      res.status(200).json("success");
    } catch (error) {
      next(error);
    }
  }

  async updateFavoriteStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { fileId, isFavorite } = req.body as {
        fileId: string;
        isFavorite: boolean;
      };

      if (typeof isFavorite !== "boolean") {
        throw new AppError("O campo isFavorite deve ser um booleano!", 400);
      }

      const file = await database.files.findFirst({
        where: {
          id: fileId,
          userId: user.id,
        },
      });

      if (!file) {
        throw new AppError("Arquivo não encontrado!", 404);
      }

      if (file.status !== "ACTIVE") {
        throw new AppError("Só é possível favoritar arquivos ativos!", 400);
      }

      if (file.isFavorite === isFavorite) {
        const actionWord = isFavorite ? "favoritado" : "desfavoritado";
        throw new AppError(`Este arquivo já está ${actionWord}!`, 400);
      }

      await database.files.update({
        where: {
          id: fileId,
          userId: user.id,
        },
        data: {
          isFavorite: isFavorite,
          lastUpdate: new Date(),
        },
      });

      res.status(200).json("success");
    } catch (error) {
      next(error);
    }
  }

  async getFile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const id = req.params[PARAMS.ID] as string;

      if (!id) {
        throw new AppError("Id do arquivo não enviado!", 400);
      }

      const file = await database.files.findFirst({
        where: {
          id,
          status: "ACTIVE" as FileStatus,
        },
      });

      if (!file) {
        throw new AppError("Arquivo não encontrado!", 404);
      }

      if (!file.isPublic && file.userId !== user.id) {
        throw new AppError("Não autorizado!", 403);
      }

      let signedPreviewUrl = null;
      if (file.preview) {
        try {
          signedPreviewUrl = await getPreviewPresignedUrl(file.preview);
        } catch (err) {
          console.error(`Erro ao gerar URL do preview para ${file.preview}:`, err);
        }
      }

      const obj = {
        file: {
          id: file.id,
          name: file.name,
          preview: signedPreviewUrl,
          format: file.format,
          size: file.size,
          createdAt: file.createdAt,
          updatedAt: file.lastUpdate
        },
      };

      file.userId !== user.id ? obj["isFavorite"] = file.isFavorite : null;

      res.status(200).json({ obj });
    } catch (error) {
      next(error);
    }
  }
}
