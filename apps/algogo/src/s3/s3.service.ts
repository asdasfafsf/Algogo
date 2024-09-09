import { Injectable, Inject } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import s3Config from '../config/s3Config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  constructor(
    @Inject(s3Config.KEY) private readonly config: ConfigType<typeof s3Config>,
  ) {
    this.s3Client = new S3Client({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
      },
    });
  }

  async upload(Key: string, Body: Buffer, ContentType?: string) {
    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key,
      Body,
      ACL: 'public-read',
      ContentType,
    });

    await this.s3Client.send(command);

    const fileUrl = `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${Key}`;
    return fileUrl;
  }
}
