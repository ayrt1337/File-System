import ytDlpExec from "yt-dlp-exec";

export const downloadMedia = async (url: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const subprocess = (ytDlpExec as any).exec(url, {
      output: "-",
    });

    const chunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    subprocess.stdout?.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    subprocess.stderr?.on("data", (chunk: Buffer) => {
      stderrChunks.push(chunk);
    });

    subprocess.on("error", (error: any) => {
      reject(error);
    });

    subprocess.on("close", (code: any) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
      } else {
        const errorMsg = Buffer.concat(stderrChunks).toString("utf-8").trim();
        console.error("yt-dlp error:", errorMsg);
        reject(
          new Error(
            `O download falhou. yt-dlp finalizou com código de saída ${code}. Detalhes: ${errorMsg}`,
          ),
        );
      }
    });
  });
};
