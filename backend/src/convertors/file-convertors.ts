import { ConvertContext, ConvertResult } from "../types/convert.js";

const getBaseName = (filename: string) => {
  const index = filename.lastIndexOf(".");
  return index === -1 ? filename : filename.substring(0, index);
};

export class FileConvertors {
  async docxToPdf({ file }: ConvertContext): Promise<ConvertResult> {
    return {
      buffer: file.buffer,
      mimeType: "application/pdf",
      fileName: `${getBaseName(file.originalname)}.pdf`
    };
  }

  async pdfToDocx({ file }: ConvertContext): Promise<ConvertResult> {
    return {
      buffer: file.buffer,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileName: `${getBaseName(file.originalname)}.docx`
    };
  }

  async pngToPdf({ file }: ConvertContext): Promise<ConvertResult> {
    return {
      buffer: file.buffer,
      mimeType: "application/pdf",
      fileName: `${getBaseName(file.originalname)}.pdf`
    };
  }
}