// api/evaluation/upload-url-aws
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
const BUCKET = process.env.AWS_S3_BUCKET;

export async function GET(req) {
  const filename = req.nextUrl.searchParams.get("filename");
  const contentType = req.nextUrl.searchParams.get("contentType") || "image/jpeg";
  if (!filename) return NextResponse.json({ error: "filename required" }, { status: 400 });
  const fileKey = `makro-img-evaluation/${filename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileKey,
    ContentType: contentType, // << สำคัญ!!
    // ACL: "public-read" // << เอาออก!
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 });
  const fileUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

  return NextResponse.json({ url, fileUrl });
}