import { AppError } from "../errors/app-error.js";
import { ConvertContext, ConvertResult } from "../types/convert.js";
import sharp from "sharp";

const getBaseName = (filename: string) => {
  const index = filename.lastIndexOf(".");
  return index === -1 ? filename : filename.substring(0, index);
};

export class ImageConvertors {
  async imageConverter(context: ConvertContext): Promise<ConvertResult> {
    const { file, to } = context;

    if (!file.mimetype.startsWith("image")) {
      throw new AppError("Formato inválido!", 400);
    }

    const format = to.toLowerCase();
    let image = sharp(file.buffer);

    if (format === "png") image = image.png();
    else if (format === "jpeg" || to === "jpg") image = image.jpeg();
    else if (format === "webp") image = image.webp();

    const imageBuffer = await image.toBuffer();

    return {
      buffer: imageBuffer,
      mimeType: `image/${format}`,
      fileName: `${getBaseName(file.originalname)}.${format}`,
    };
  }
}
