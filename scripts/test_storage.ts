import { S3Client, PutObjectCommand, GetObjectCommand, ListBucketsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.AWS_ENDPOINT_URL_S3 || "https://br-wispy-dust-b3es6wwi.storage.c-4.ap-southeast-1.aws.neon.tech";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "nak_live_bf72db8e9e0b421f919228426482c1ac";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "nsk_live_ff441594a48fb4b50f1e48d377965daf089f6d0a5fe6a005a1bdd51c3e24e3d1";
const region = process.env.AWS_REGION || "ap-southeast-1";

const s3 = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  },
  forcePathStyle: true
});

async function testStorage() {
  try {
    console.log("Testing Neon S3 Storage connection...");
    const bucket = "assets";
    const key = "test/connection_test.txt";

    console.log("Uploading test file to bucket:", bucket);
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: "BondRoot Family Tree Storage Initialized!",
      ContentType: "text/plain"
    }));
    console.log("✓ Upload successful!");

    const signedUrl = await getSignedUrl(s3, new GetObjectCommand({
      Bucket: bucket,
      Key: key
    }), { expiresIn: 3600 });

    console.log("✓ Signed URL generated:", signedUrl);
    console.log("\n🎉 NEON S3 STORAGE IS 100% OPERATIONAL! 🎉");
  } catch (err) {
    console.error("Storage error:", err);
  }
}

testStorage();
