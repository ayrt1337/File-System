import { SQSClient } from "@aws-sdk/client-sqs";

export const sqsClient = new SQSClient({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

export const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL;
