import { Request, Response, NextFunction } from "express";
import database from "../config/database.js";
import * as services from "../services/index.js";
import { AppError } from "../errors/app-error.js";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await database.user.findUnique({
        where: { email: email },
      });

      if (!user || user.inactive) {
        const newPassword = await services.hashData(password);
        const token = services.genToken(
          {
            email: email,
            password: newPassword,
          },
          600,
        );
        services.sendEmail({
          to: email,
          subject: "Confirmação de Email",
          path: "confirm-email",
          token: token,
        });
      }

      res.status(200).json("success");
    } catch (error: any) {
      console.error("Erro no envio de email de registro: ", error.message);
      res.status(200).json("success");
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, rememberMe } = req.body;

      const user = await database.user.findUnique({
        where: { email: email, inactive: false },
      });

      if (!user || !(await services.compareHash(password, user.password))) {
        throw new AppError("Dados incorretos!", 400);
      }

      const maxAge = rememberMe ? 3600000 * 8766 : 3600000 * 24;
      const sessionId = services.genToken(
        {
          id: user.id,
        },
        maxAge,
      );

      res.cookie("sessionId", sessionId, {
        maxAge,
        secure: true,
        httpOnly: true,
        sameSite: true,
      });
      res.status(200).json({
        token: sessionId,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async reset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const user = await database.user.findUnique({
        where: { email: email },
      });

      if (user) {
        const token = services.genToken({ email }, 600);
        services.sendEmail({
          to: email,
          subject: "Alteração de Senha",
          path: "confirm-password",
          token: token,
        });
      }

      res.status(200).json("success");
    } catch (error: any) {
      console.log(
        "Erro no envio de email de alteração de senha: ",
        error.message,
      );
      res.status(200).json("success");
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { password, token } = req.body;

      const decoded = services.decodeToken(token) as {
        data: { email: string };
      };

      if (!decoded) {
        throw new AppError("Bad Request", 400);
      }
      const hashPassword = await services.hashData(password);
      await database.user.update({
        where: { email: decoded.data.email },
        data: { password: hashPassword },
      });

      res.status(200).json("success");
    } catch (error: any) {
      next(error);
    }
  }

  async confirmEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query as { token: string };

      const decoded = services.verifyToken(token) as {
        data: { email: string; password: string };
      };

      if (!decoded) {
        throw new AppError("Bad Request", 400);
      }

      if (!decoded.data.password) {
        res.status(200).json("success");
        return;
      }

      await database.user.upsert({
        where: { email: decoded.data.email },
        update: {
          name: "Usuário",
          inactive: false,
          password: decoded.data.password,
          lastUpdate: new Date(),
        },
        create: {
          name: "Usuário",
          email: decoded.data.email,
          password: decoded.data.password,
        },
      });

      res.status(200).json("success");
    } catch (error: any) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("sessionId");
      res.status(200).json("success");
    } catch (error: any) {
      next(error);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json("authenticated");
    } catch (error: any) {
      next(error);
    }
  }
}
