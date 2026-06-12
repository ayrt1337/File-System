import { AppError } from "../errors/app-error.js";
import { ConvertContext, ConvertResult } from "../types/convert.js";
import { convertMedia } from "../utils/media-helper.js";

const getBaseName = (filename: string) => {
  const index = filename.lastIndexOf(".");
  return index === -1 ? filename : filename.substring(0, index);
};

export class AudioConvertors {
  async audioConverter({ file, to }: ConvertContext): Promise<ConvertResult> {
    if (!file.mimetype.startsWith("audio") || !file.mimetype.startsWith("video")) {
      throw new AppError("Formato inválido!", 400);
    }

    const buffer = await convertMedia(
      file.buffer,
      file.originalname,
      to.toLowerCase(),
    );
    return {
      buffer,
      mimeType: `audio/${to.toLowerCase()}`,
      fileName: `${getBaseName(file.originalname)}.${to.toLowerCase()}`,
    };
  }
}
