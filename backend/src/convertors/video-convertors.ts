import { ConvertContext, ConvertResult } from "../types/convert.js";

const getBaseName = (filename: string) => {
  const index = filename.lastIndexOf(".");
  return index === -1 ? filename : filename.substring(0, index);
};

export class VideoConvertors {
  async mp4ToMp3({ file }: ConvertContext): Promise<ConvertResult> {
    return {
      buffer: file.buffer,
      mimeType: "audio/mpeg",
      fileName: `${getBaseName(file.originalname)}.mp3`
    };
  }

  async mp4ToAvi({ file }: ConvertContext): Promise<ConvertResult> {
    return {
      buffer: file.buffer,
      mimeType: "video/x-msvideo",
      fileName: `${getBaseName(file.originalname)}.avi`
    };
  }

  async aviToMp4({ file }: ConvertContext): Promise<ConvertResult> {
    return {
      buffer: file.buffer,
      mimeType: "video/mp4",
      fileName: `${getBaseName(file.originalname)}.mp4`
    };
  }

  async mp4ToGif({ file }: ConvertContext): Promise<ConvertResult> {
    return {
      buffer: file.buffer,
      mimeType: "image/gif",
      fileName: `${getBaseName(file.originalname)}.gif`
    };
  }
}