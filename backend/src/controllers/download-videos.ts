import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { downloadMedia } from "../utils/downloader-helper.js";

const platforms: string[] = ["youtube", "twitter", "x"];

export class DownloadVideosController {
  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const { source } = req.query as { source: string };

      const match = source.match(
        /^(?:https?:\/\/)?(?:www\.|m\.|mobile\.)?([a-zA-Z0-9-]+)\.[a-z]+/i,
      );

      if (!match) {
        throw new AppError("Endereço inválido!", 400);
      };

      const platform = match[1].toLowerCase();
      if (!platforms.includes(platform)) {
        throw new AppError(`A plataforma ${platform} não é suportada!`, 400);
      }

      const output = await downloadMedia(source);
      res.setHeader("Content-Type", "video/mp4");
      res.send(output);
    } catch (error) {
      next(error);
    }
  }
}
