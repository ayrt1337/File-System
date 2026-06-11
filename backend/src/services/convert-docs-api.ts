import "dotenv/config";
import { ConvertAPI } from "convertapi";
import { ConvertContext } from "../types/convert.js";
import { Readable } from "stream";
import axios from "axios";

const convertApi = new ConvertAPI(process.env.CONVERT_API_KEY);

export const convertDoc = async ({ file, to, from }: ConvertContext) => {
  const stream = Readable.from(file.buffer);
  const uploadFile = await convertApi.upload(stream, file.originalname);

  const result = await convertApi.convert(
    to.toLowerCase(),
    {
      File: uploadFile,
    },
    from.toLowerCase(),
  );

  const convertedFile = await axios.get(result.file.url, { responseType: "arraybuffer" });
  const convertedFileBuffer = Buffer.from(convertedFile.data);

  return convertedFileBuffer;
};
