import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, BUCKET_NAME } from "../config/s3-client.js";

export async function getUploadPresignedUrl(
  userId: string,
  fileName: string,
  contentType: string,
) {
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const s3Key = `uploads/${userId}/${Date.now()}_${cleanFileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  return { url, s3Key };
}

export async function getDownloadPresignedUrl(s3Key: string, fileName: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(fileName)}"`,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 900 });
}
