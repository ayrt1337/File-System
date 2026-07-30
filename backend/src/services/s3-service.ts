import {
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, BUCKET_NAME } from "../config/s3-client.js";

export async function getUploadPresignedUrl(
  userId: string,
  fileName: string,
  contentType: string,
  hasPreview: boolean,
) {
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const s3Key = `files/${userId}/${Date.now()}_${cleanFileName}`;
  let previewUrl = "";

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ContentType: contentType,
  });

  if (hasPreview) {
    const previewS3Key = s3Key.replace("files", "previews");

    const previewCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: previewS3Key,
      ContentType: "image/jpeg",
    });

    previewUrl = await getSignedUrl(s3Client, previewCommand, {
      expiresIn: 900,
    });
  }

  const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  return { url, previewUrl, s3Key };
}

export async function getDownloadPresignedUrl(s3Key: string, fileName: string, fileFormat: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(`${fileName.slice(0, fileName.lastIndexOf("."))}.${fileFormat}`)}"`,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 900 });
}

export async function getFilePresignedUrl(s3Key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 900 });
}

export async function getTotalUserFiles(userId: string) {
  let totalFiles = 0;
  let isTruncated = true;
  let continuationToken = undefined;

  const prefix = `files/${userId}/`;

  while (isTruncated) {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);

    if (response.Contents) totalFiles += response.Contents.length;

    isTruncated = response.IsTruncated;
    continuationToken = response.NextContinuationToken;
  }

  return totalFiles;
}
