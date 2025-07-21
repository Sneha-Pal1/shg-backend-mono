import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    this.s3 = new S3Client({
      endpoint: process.env.AWS_ENDPOINT,
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_KEY!,
      },
      forcePathStyle: true,
    });
    this.bucket = process.env.AWS_BUCKET || 'product-images';
    this.publicUrl = process.env.AWS_PUBLIC_URL || process.env.AWS_ENDPOINT!;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const sanitizedFileName = file.originalname.replace(
      /[^a-zA-Z0-9_.-]/g,
      '_',
    );
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: sanitizedFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // or remove for private files
    });

    await this.s3.send(command);

    const fileUrl = `${this.publicUrl}/${sanitizedFileName}`;

    return fileUrl;
  }

  async deleteFile(url: string): Promise<void> {
    const fileKey = url.split('/').pop();
    if (!fileKey) return;
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
    });
    await this.s3.send(command);
  }
}
