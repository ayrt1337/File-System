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
  const safeName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, "_") || "temp_media";
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

export async function enhanceVideoQuality(
  fileBuffer: Buffer,
  originalName: string,
  targetWidth: number,
  targetHeight: number
): Promise<Buffer> {
  const tempDir = os.tmpdir();
  const timestamp = Date.now();
  const safeName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, "_") || "temp_media";
  const inputPath = path.join(tempDir, `enhance_input_${timestamp}_${safeName}`);
  const outputPath = path.join(tempDir, `enhance_output_${timestamp}.mp4`);

  try {
    await fs.writeFile(inputPath, fileBuffer);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec("libx264")
        .outputOptions([
          "-crf 18",
          "-preset slow"
        ])
        .videoFilters([
          `scale=${targetWidth}:${targetHeight}:flags=lanczos`,
          "unsharp=5:5:1.0:5:5:0.0"
        ])
        .on("end", () => resolve())
        .on("error", (err) => {
          console.error(`FFmpeg video enhancement error (${originalName}):`, err);
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
