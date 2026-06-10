import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

ffmpeg.setFfmpegPath(ffmpegPath.path);

export async function convertMedia(
  fileBuffer: Buffer,
  originalName: string,
  outputExt: string
): Promise<Buffer> {
  const tempDir = os.tmpdir();
  const timestamp = Date.now();
  const safeName = path.basename(originalName);
  const inputPath = path.join(tempDir, `input_${timestamp}_${safeName}`);
  const outputPath = path.join(tempDir, `output_${timestamp}.${outputExt}`);

  try {
    await fs.writeFile(inputPath, fileBuffer);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat(outputExt)
        .on("end", () => resolve())
        .on("error", (err) => {
          console.error(`FFmpeg conversion error (${originalName} -> ${outputExt}):`, err);
          reject(err);
        })
        .save(outputPath);
    });

    const resultBuffer = await fs.readFile(outputPath);
    return resultBuffer;
  } finally {
    try {
      await fs.unlink(inputPath);
    } catch (err) {
      console.warn(`Could not clean up temporary input file: ${inputPath}`, err);
    }
    try {
      await fs.unlink(outputPath);
    } catch (err) {
      console.warn(`Could not clean up temporary output file: ${outputPath}`, err);
    }
  }
}
