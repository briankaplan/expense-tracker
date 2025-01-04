import { S3Client } from '@aws-sdk/client-s3';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.NEXT_PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY || ''
  }
});

export const R2_BUCKET_NAME = process.env.NEXT_PUBLIC_R2_BUCKET_NAME || '';

export async function uploadToR2(file: File, path: string): Promise<string> {
  const { PutObjectCommand } = await import('@aws-sdk/client-s3');
  
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: path,
    Body: file,
    ContentType: file.type,
  });

  await r2Client.send(command);
  
  // Return the public URL
  return `https://${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${path}`;
} 