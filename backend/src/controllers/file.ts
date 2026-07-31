import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import {
  getUploadPresignedUrl,
  getDownloadPresignedUrl,
  getFilePresignedUrl,
  getTotalUserFiles,
} from "../services/s3-service.js";
import database from "../config/database.js";
import { FileStatus, FileRole } from "../types/file.js";
import { PARAMS } from "../routing/routes.js";
import {
  checkFilePermission,
  getUserFileRole,
} from "../services/permission-service.js";
import { parseRole, parseRoleOptional } from "../utils/role-parser.js";
import { hasPreview, hasView } from "../utils/files-utils.js";

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
          isFavorite: true,
          isPublic: true,
          publicRole: true,
          createdAt: true,
          lastUpdate: true,
          sharedFiles: {
            select: {
              userRole: true,
              user: {
                select: {
                  email: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      const databaseUserFiles = await database.files.count({
        where: {
          userId: user.id,
        },
      });

      const s3UserFiles = await getTotalUserFiles(user.id);

      const filesWithPreviews = files.map((file) => {
        return {
          ...file,
          role: 3,
          sharedUsers: file.sharedFiles.map((sf) => ({
            email: sf.user.email,
            name: sf.user.name,
            avatarUrl: sf.user.avatarUrl,
            role: sf.userRole === 1 ? "reader" : "editor",
          })),
        };
      });

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
        !!preview,
      );

      res.status(200).json({
        url: result.url,
        previewUrl: result.previewUrl,
      });
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

      const file = await database.files.findUnique({
        where: {
          id: fileId,
        },
      });

      if (!file) {
        throw new AppError("Arquivo não encontrado!", 404);
      }

      await checkFilePermission(user.id, file.id, FileRole.EDITOR);

      if (file.status !== "ACTIVE") {
        throw new AppError("Só é possível renomear arquivos ativos!", 400);
      }

      await database.files.update({
        where: {
          id: fileId,
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

      if (status !== "ACTIVE" && status !== "TRASH" && status !== "DELETED") {
        throw new AppError("Status de arquivo inválido!", 400);
      }

      const file = await database.files.findUnique({
        where: {
          id: fileId,
        },
      });

      if (!file) {
        throw new AppError("Arquivo não encontrado!", 404);
      }

      if (file.userId !== user.id) {
        throw new AppError("Não autorizado", 403);
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

      if (status === "DELETED" && file.status !== "TRASH") {
        throw new AppError(
          "Só é possível deletar um arquivo que está na lixeira!",
          400,
        );
      }

      await database.files.update({
        where: {
          id: fileId,
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

      const file = await database.files.findUnique({
        where: {
          id: fileId,
        },
      });

      if (!file) {
        throw new AppError("Arquivo não encontrado!", 404);
      }

      if (file.userId !== user.id) {
        throw new AppError("Não autorizado", 403);
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
        include: {
          sharedFiles: {
            include: {
              user: {
                select: {
                  email: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      if (!file) {
        throw new AppError("Arquivo não encontrado!", 404);
      }

      await checkFilePermission(user.id, file.id, FileRole.READER);

      const userRole = await getUserFileRole(user.id, file.id);

      const fileResponse = {
        id: file.id,
        name: file.name,
        format: file.format,
        size: file.size,
        createdAt: file.createdAt,
        updatedAt: file.lastUpdate,
        isFavorite: file.userId === user.id ? file.isFavorite : null,
        isPublic: file.userId === user.id ? file.isPublic : null,
        publicRole: file.userId === user.id ? file.publicRole : null,
        sharedUsers:
          file.userId === user.id
            ? file.sharedFiles.map((sf) => ({
                email: sf.user.email,
                name: sf.user.name,
                avatarUrl: sf.user.avatarUrl,
                role: sf.userRole === 1 ? "reader" : "editor",
              }))
            : [],
        role: userRole,
      };

      res.status(200).json({ fileResponse });
    } catch (error) {
      next(error);
    }
  }

  async updateFileAccess(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      const { usersAccess, publicAccess, fileId } = req.body as {
        usersAccess: [{ email: string; role: any }];
        publicAccess: { isPublic: boolean; publicRole: any };
        fileId: string;
      };

      const file = await database.files.findUnique({
        where: {
          id: fileId,
        },
      });

      if (!file) {
        throw new AppError("Arquivo não encontrado!", 404);
      }

      if (file.userId !== user.id) {
        throw new AppError("Não autorizado", 403);
      }

      await database.$transaction(async (tx) => {
        await tx.sharedFiles.deleteMany({
          where: {
            fileId,
          },
        });

        for (const userAccess of usersAccess) {
          const user = await tx.user.findUnique({
            where: {
              email: userAccess.email,
            },
          });

          if (!user) {
            throw new AppError(
              `Usuário com o e-mail ${userAccess.email} não encontrado!`,
              404,
            );
          }

          const numericRole = parseRole(userAccess.role);

          await tx.sharedFiles.create({
            data: {
              fileId,
              userId: user.id,
              userRole: numericRole,
            },
          });
        }
      });

      if (publicAccess) {
        await database.files.update({
          where: {
            id: fileId,
          },
          data: {
            isPublic: publicAccess.isPublic,
            publicRole: parseRoleOptional(publicAccess.publicRole),
          },
        });
      }

      const updatedFile = await database.files.findUnique({
        where: { id: fileId },
        include: {
          sharedFiles: {
            include: {
              user: {
                select: {
                  email: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      if (!updatedFile) {
        throw new AppError("Arquivo não encontrado!", 404);
      }

      const fileAccessResponse = {
        isPublic: updatedFile.isPublic,
        publicRole: updatedFile.publicRole,
        sharedUsers: updatedFile.sharedFiles.map((sf) => ({
          email: sf.user.email,
          name: sf.user.name,
          avatarUrl: sf.user.avatarUrl,
          role: sf.userRole === 1 ? "reader" : "editor",
        })),
      };

      res.status(200).json(fileAccessResponse);
    } catch (error) {
      next(error);
    }
  }

  async getSharedFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      const sharedRecords = await database.sharedFiles.findMany({
        where: {
          userId: user.id,
          file: {
            status: "ACTIVE",
          },
        },
        include: {
          file: {
            select: {
              id: true,
              name: true,
              size: true,
              format: true,
              preview: true,
              createdAt: true,
              lastUpdate: true,
              userId: true,
            },
          },
        },
      });

      const filesWithPreviews = await Promise.all(
        sharedRecords.map(async (record) => {
          const file = record.file;
          const userRole = await getUserFileRole(user.id, file.id);

          return {
            id: file.id,
            name: file.name,
            size: file.size,
            format: file.format,
            createdAt: file.createdAt,
            lastUpdate: file.lastUpdate,
            role: userRole,
          };
        }),
      );

      res.status(200).json({
        files: filesWithPreviews,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const type = req.query.type as string | undefined;

      const file = await database.files.findUnique({
        where: { id: id as string },
      });

      if (!file) {
        throw new AppError("Arquivo não encontrado!", 404);
      }

      await checkFilePermission(user.id, file.id, FileRole.READER);

      let signedPreviewUrl: string | null = null;
      let signedFileUrl: string | null = null;

      const fetchPreview =
        (type === "preview" || type === "both" || !type) &&
        hasPreview(file.format);
      const fetchDownload =
        type === "download" ||
        ((type === "url" || type === "both" || !type) && hasView(file.format));

      if (fetchPreview && file.preview) {
        try {
          signedPreviewUrl = await getFilePresignedUrl(file.preview);
        } catch (err) {
          console.error(
            `Erro ao assinar URL de preview para ${file.preview}:`,
            err,
          );
        }
      }

      if (fetchDownload) {
        try {
          if (type === "download") {
            signedFileUrl = await getDownloadPresignedUrl(
              file.s3Key,
              file.name,
              file.format,
            );
          } else {
            signedFileUrl = await getFilePresignedUrl(file.s3Key);
          }
        } catch (err) {
          console.error(
            `Erro ao assinar URL de download para ${file.s3Key}:`,
            err,
          );
        }
      }

      res.status(200).json({
        url: signedFileUrl,
        preview: signedPreviewUrl,
      });
    } catch (error) {
      next(error);
    }
  }
}
