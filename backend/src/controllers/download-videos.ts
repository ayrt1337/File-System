import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { downloadMedia } from "../utils/downloader-helper.js";

const platforms: string[] = ["youtube", "twitter", "x"];

export const qualityMapping: Record<string, { width: number; height: number }> = {
  "360p": { width: 640, height: 360 },
  "480p": { width: 854, height: 480 },
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
};

export const outputFormatMapping: Record<string, string> = {
  mp4: "video/mp4",
  mp3: "audio/mp3",
};

export class DownloadVideosController {
  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const { source, quality, format } = req.query as {
        source: string;
        quality?: string;
        format?: string;
      };

      const match = source.match(
        /^(?:https?:\/\/)?(?:www\.|m\.|mobile\.)?([a-zA-Z0-9-]+)\.[a-z]+/i,
      );

      if (!match) {
        throw new AppError("Endereço inválido!", 400);
      }

      const platform = match[1].toLowerCase();
      if (!platforms.includes(platform)) {
        throw new AppError(`A plataforma ${platform} não é suportada!`, 400);
      }

      const outputFormat = format && outputFormatMapping[format] ? format : "mp4";
      const outputQuality = quality && qualityMapping[quality] ? quality : "360p";
      const output = await downloadMedia(source, outputQuality, outputFormat);

      const safeFilename = source.replace(/[^a-zA-Z0-9._-]/g, "_");

      res.setHeader("Content-Type", outputFormatMapping[outputFormat]);
      res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
      res.send(output);
    } catch (error) {
      next(error);
    }
  }
}
