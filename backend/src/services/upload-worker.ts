import { ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient, QUEUE_URL } from "../config/sqs-client.js";
import database from "../config/database.js";

export async function startUploadWorker() {
  console.log("Worker do SQS iniciado com sucesso. Escutando novos eventos...");

  while (true) {
    try {
      const response = await sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: QUEUE_URL,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20,
        })
      );

      if (!response.Messages || response.Messages.length === 0) {
        continue;
      }

      for (const message of response.Messages) {
        try {
          const body = JSON.parse(message.Body || "{}");

          if (body.Records) {
            for (const record of body.Records) {
              const s3Key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
              const size = record.s3.object.size || 0;

              console.log(`Novo upload detectado no S3: ${s3Key} (${size} bytes)`);

              const parts = s3Key.split("/");
              if (parts[0] === "uploads" && parts.length >= 3) {
                const userId = parts[1];
                const filenameWithTimestamp = parts[2];

                const underscoreIdx = filenameWithTimestamp.indexOf("_");
                const originalName = underscoreIdx !== -1 
                  ? filenameWithTimestamp.substring(underscoreIdx + 1) 
                  : filenameWithTimestamp;

                const dotIdx = originalName.lastIndexOf(".");
                const format = dotIdx !== -1 
                  ? originalName.substring(dotIdx + 1).toLowerCase() 
                  : "";

                console.log(`Registrando arquivo no PostgreSQL: "${originalName}" (${format}) para o usuário ${userId}`);

                await database.files.create({
                  data: {
                    name: originalName,
                    format: format,
                    size: size,
                    s3Key: s3Key,
                    userId: userId,
                  },
                });
              } else {
                console.warn(`Chave S3 com formato inválido para registro: ${s3Key}`);
              }
            }
          }

          await sqsClient.send(
            new DeleteMessageCommand({
              QueueUrl: QUEUE_URL,
              ReceiptHandle: message.ReceiptHandle,
            })
          );
        } catch (messageError) {
          console.error("Erro ao processar mensagem específica do SQS:", messageError);
        }
      }
    } catch (error) {
      console.error("Erro no loop principal do worker SQS:", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
