import { Request, Response, NextFunction } from "express";
import database from "../config/database.js";
import { AppError } from "../errors/app-error.js";

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      res.status(200).json({ email: user.email, name: user.name, avatarUrl: user.avatarUrl });
    } catch (error: any) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { name, avatarUrl } = req.body;

      await database.user.update({
        where: { id: user.id },
        data: {
          name,
          ...(avatarUrl !== undefined && { avatarUrl }),
          lastUpdate: new Date(),
        },
      });

      res.status(200).json("success");
    } catch (error: any) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      await database.user.update({
        where: { id: user.id },
        data: { inactive: true, lastUpdate: new Date() },
      });

      res.clearCookie("sessionId");
      res.status(200).json("success");
    } catch (error: any) {
      next(error);
    }
  }

  async checkUserEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.query;
      if (!email || typeof email !== "string") {
        throw new AppError("E-mail é obrigatório!", 400);
      }

      const targetUser = await database.user.findFirst({
        where: {
          email: email.toLowerCase(),
          inactive: false,
        },
        select: {
          email: true,
          name: true,
          avatarUrl: true,
        },
      });

      if (!targetUser) {
        throw new AppError("Usuário não encontrado!", 404);
      }

      res.status(200).json(targetUser);
    } catch (error: any) {
      next(error);
    }
  }
}
