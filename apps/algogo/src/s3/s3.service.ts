import { Injectable, Inject } from '@nestjs/common';
import {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
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
      forcePathStyle: true,
      endpoint: this.config.endpoint,
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

    const fileUrl = `${this.config.endpoint}/${this.config.bucketName}/${Key}`;
    return fileUrl;
  }

  async removeObject(Key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.config.bucketName,
      Key: Key.replace(this.config.endpoint, ''),
    });

    await this.s3Client.send(command);
  }
}
