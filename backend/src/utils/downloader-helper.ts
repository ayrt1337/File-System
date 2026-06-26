import ytDlpExec from "yt-dlp-exec";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import path from "path";
import os from "os";
import { promises as fs } from "fs";
import {
  qualityMapping,
  outputFormatMapping,
} from "../controllers/download-videos.js";

export const downloadMedia = async (
  url: string,
  quality: string,
  outputFormat: string,
): Promise<Buffer> => {
  const tempDir = os.tmpdir();
  const timestamp = Date.now();

  const cleanUrl = url.replace(/[^a-zA-Z0-9._-]/g, "_") || "temp_media";
  const safeBase = path.basename(cleanUrl).substring(0, 50);

  const tempFilePath = path.join(
    tempDir,
    `download_${timestamp}_${safeBase}.${outputFormat}`,
  );
  const ffmpegDir = path.dirname(ffmpegPath.path);

  try {
    let options: Record<string, any> = {
      output: tempFilePath,
      ffmpegLocation: ffmpegDir,
    };

    if (outputFormatMapping[outputFormat].includes("audio")) {
      options = {
        ...options,
        format: "bestaudio/best",
        extractAudio: true,
        audioFormat: outputFormat,
      };
    } else {
      const height = (qualityMapping[quality] && qualityMapping[quality].height) || 360;

      options = {
        ...options,
        format: `bestvideo[height<=${height}]+bestaudio/best/best[height<=${height}]/best`,
        mergeOutputFormat: outputFormat,
        postprocessorArgs: "Merger+ffmpeg:-strict -2",
      };
    }

    await ytDlpExec(url, options);

    const buffer = await fs.readFile(tempFilePath);
    return buffer;
  } finally {
    try {
      await fs.unlink(tempFilePath);
    } catch {}
  }
};
