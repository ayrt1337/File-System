import { ConvertContext, ConvertResult } from "../types/convert.js";

const getBaseName = (filename: string) => {
  const index = filename.lastIndexOf(".");
  return index === -1 ? filename : filename.substring(0, index);
};

export class AudioConvertors {
  async mp3ToWav({ file }: ConvertContext): Promise<ConvertResult> {
    return {
      buffer: file.buffer,
      mimeType: "audio/wav",
      fileName: `${getBaseName(file.originalname)}.wav`
    };
  }

  async wavToMp3({ file }: ConvertContext): Promise<ConvertResult> {
    return {
      buffer: file.buffer,
      mimeType: "audio/mpeg",
      fileName: `${getBaseName(file.originalname)}.mp3`
    };
  }

  async m4aToMp3({ file }: ConvertContext): Promise<ConvertResult> {
    return {
      buffer: file.buffer,
      mimeType: "audio/mpeg",
      fileName: `${getBaseName(file.originalname)}.mp3`
    };
  }

  async flacToMp3({ file }: ConvertContext): Promise<ConvertResult> {
    return {
      buffer: file.buffer,
      mimeType: "audio/mpeg",
      fileName: `${getBaseName(file.originalname)}.mp3`
    };
  }
}