import ytDlpExec from "yt-dlp-exec";

export const downloadMedia = async (url: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const subprocess = (ytDlpExec as any).exec(url, {
      output: "-",
    });

    const chunks: Buffer[] = [];

    subprocess.stdout?.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    subprocess.on("error", (error) => {
      reject(error);
    });

    subprocess.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(new Error(`O download falhou. yt-dlp finalizou com código de saída ${code}`));
      }
    });
  });
};
