import { Request, Response, NextFunction } from "express";
import { AudioConvertors } from "../convertors/audio-convertors.js";
import { VideoConvertors } from "../convertors/video-convertors.js";
import { FileConvertors } from "../convertors/file-convertors.js";
import { ImageConvertors } from "../convertors/image-convertors.js";
import { ConvertResult } from "../types/convert.js";
import { AppError } from "../errors/app-error.js";

const audioConvertors = new AudioConvertors();
const videoConvertors = new VideoConvertors();
const fileConvertors = new FileConvertors();
const imageConvertors = new ImageConvertors();

const convertorsRegistry: Record<string, { instance: any; method: string }> = {
  // Video
  "mp4": { instance: videoConvertors, method: "videoConverter" },
  "avi": { instance: videoConvertors, method: "videoConverter" },

  // Audio
  "wav": { instance: audioConvertors, method: "audioConverter" },
  "mp3": { instance: audioConvertors, method: "audioConverter" },

  // Document
  "docx-pdf": { instance: fileConvertors, method: "docxToPdf" },
  "pdf-docx": { instance: fileConvertors, method: "pdfToDocx" },
  "png-pdf": { instance: fileConvertors, method: "pngToPdf" },

  // Image
  "png": { instance: imageConvertors, method: "imageConverter" },
  "jpeg": { instance: imageConvertors, method: "imageConverter" },
  "jpg": { instance: imageConvertors, method: "imageConverter" },
  "webp": { instance: imageConvertors, method: "imageConverter" },
};

export class FileConvertorController {
  async convert(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      const { from, to } = req.query as { from: string, to: string }

      const dotIndex = file.originalname.lastIndexOf(".");
      const fileExt = dotIndex !== -1 ? file.originalname.substring(dotIndex + 1).toLowerCase() : "";

      if (!file || !to) {
        throw new AppError("Requisição inválida!", 400);
      }

      if (file.size <= 0) {
        throw new AppError("Arquivo inválido!", 400);
      }

      if (fileExt === to.toLowerCase()) {
        throw new AppError("O formato de entrada é o mesmo de saída!", 400);
      }

      if (from) {
        if (from.toLowerCase() === to.toLowerCase()) {
          throw new AppError("O formato de entrada é o mesmo de saída!", 400);
        }

        const ext = "." + from.toLowerCase();
        if (!file.originalname.toLowerCase().endsWith(ext)) {
          throw new AppError("O arquivo enviado não corresponde ao formato de origem selecionado!", 400);
        }
      }

      const key = from ? `${from.toLowerCase()}-${to.toLowerCase()}` : to.toLowerCase();
      const mapping = convertorsRegistry[key];

      if (!mapping) {
        const message = from ? `de ${from.toUpperCase()}` : "";
        throw new AppError(`Conversão ${message} para ${to.toUpperCase()} não suportada!`, 400);
      }

      const { instance, method } = mapping;
      if (typeof instance[method] !== "function") {
        throw new AppError(`O método de conversão ${method} não está implementado!`, 400);
      }

      const result: ConvertResult = await instance[method]({ file, from, to });

      res.setHeader("Content-Type", result.mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
      res.send(result.buffer);
    } catch (error) {
      next(error);
    }
  }
}
