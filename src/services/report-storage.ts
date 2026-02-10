import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({});

export function buildReportKey({ job, date }) {
  return `reports/${job}/${date}/report.txt`;
}

export async function uploadReport({ bucket, key, body }) {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: "text/plain; charset=utf-8",
    ServerSideEncryption: "AES256"
  });

  await s3.send(cmd);
}

export async function createPresignedUrl({ bucket, key, expiresIn }) {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn });
}
