import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.AWS_ENDPOINT_URL_S3 || "https://br-wispy-dust-b3es6wwi.storage.c-4.ap-southeast-1.aws.neon.tech";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "nak_live_bf72db8e9e0b421f919228426482c1ac";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "nsk_live_ff441594a48fb4b50f1e48d377965daf089f6d0a5fe6a005a1bdd51c3e24e3d1";
const region = process.env.AWS_REGION || "ap-southeast-1";
export const BUCKET_NAME = "assets";

export const s3 = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  },
  forcePathStyle: true
});

export async function uploadBufferToS3(key: string, buffer: Buffer, contentType: string) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType
  }));

  // Return long-lived or public-accessible signed URL (7 days max or 24 hours)
  const downloadUrl = await getSignedUrl(s3, new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  }), { expiresIn: 86400 * 7 }); // 7 days

  return { key, downloadUrl };
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 86400) {
  return await getSignedUrl(s3, new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  }), { expiresIn });
}
