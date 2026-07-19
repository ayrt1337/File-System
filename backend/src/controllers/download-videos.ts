import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { downloadMedia } from "../utils/downloader-helper.js";
import { formatAndValidateUrl } from "../utils/url-formatter.js";

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

      if (!source) {
        throw new AppError("Endereço inválido!", 400);
      }

      const formattedUrl = formatAndValidateUrl(source);

      const outputFormat = format && outputFormatMapping[format] ? format : "mp4";
      const outputQuality = quality && qualityMapping[quality] ? quality : "360p";
      const output = await downloadMedia(formattedUrl, outputQuality, outputFormat);

      const safeFilename = formattedUrl.replace(/[^a-zA-Z0-9._-]/g, "_");

      res.setHeader("Content-Type", outputFormatMapping[outputFormat]);
      res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
      res.send(output);
    } catch (error) {
      next(error);
    }
  }
}
