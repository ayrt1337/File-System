import { convertDoc } from "../services/convert-docs-api.js";
import { ConvertContext, ConvertResult } from "../types/convert.js";

const getBaseName = (filename: string) => {
  const index = filename.lastIndexOf(".");
  return index === -1 ? filename : filename.substring(0, index);
};

export class FileConvertors {
  async docxToPdf(context: ConvertContext): Promise<ConvertResult> {
    const { file } = context;
    const convertedfile = await convertDoc(context);

    return {
      buffer: convertedfile,
      mimeType: "application/pdf",
      fileName: `${getBaseName(file.originalname)}.pdf`
    };
  }

  async pngToPdf(context: ConvertContext): Promise<ConvertResult> {
    const { file } = context;
    const convertedfile = await convertDoc(context);

    return {
      buffer: convertedfile,
      mimeType: "application/pdf",
      fileName: `${getBaseName(file.originalname)}.pdf`
    };
  }
}