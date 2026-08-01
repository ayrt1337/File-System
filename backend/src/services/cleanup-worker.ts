import cron from "node-cron";
import database from "../config/database.js";
import { deleteObjectFromS3 } from "./s3-service.js";

export async function startCleanupWorker() {
  console.log("Worker de Limpeza Recorrente iniciado.");

  cron.schedule("0 0 * * *", async () => {
    console.log("[Worker] Iniciando verificação de arquivos expirados na Lixeira...");
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await database.files.updateMany({
        where: {
          status: "TRASH",
          lastUpdate: {
            lt: thirtyDaysAgo,
          },
        },
        data: {
          status: "DELETED",
          lastUpdate: new Date(),
        },
      });

      console.log(`[Worker] Expiração concluída. ${result.count} arquivos movidos para DELETED.`);
    } catch (error) {
      console.error("[Worker] Erro ao expirar arquivos da Lixeira:", error);
    }
  });

  cron.schedule("0 0 * * 0", async () => {
    console.log("[Worker] Iniciando purga física de arquivos com status DELETED...");
    try {
      const filesToDelete = await database.files.findMany({
        where: {
          status: "DELETED",
        },
      });

      console.log(`[Worker] Encontrados ${filesToDelete.length} arquivos para serem purgados.`);

      for (const file of filesToDelete) {
        try {
          await deleteObjectFromS3(file.s3Key);

          if (file.preview) {
            await deleteObjectFromS3(file.preview);
          }

          await database.$transaction(async (tx) => {
            await tx.sharedFiles.deleteMany({
              where: { fileId: file.id }
            });
            
            await tx.files.delete({
              where: {
                id: file.id,
              },
            });
          });

          console.log(`[Worker] Arquivo ${file.name} (ID: ${file.id}) removido fisicamente.`);
        } catch (fileError) {
          console.error(`[Worker] Falha ao purgar arquivo ID ${file.id} do S3/DB:`, fileError);
        }
      }

      console.log("[Worker] Purga de arquivos concluída.");
    } catch (error) {
      console.error("[Worker] Erro ao rodar purga de arquivos DELETED:", error);
    }
  });
}
