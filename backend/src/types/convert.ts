export interface ConvertContext {
  file: Express.Multer.File;
  from: string;
  to: string;
}

export interface ConvertResult {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}