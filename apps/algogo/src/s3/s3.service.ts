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

  async upload(fileName: string, file: Buffer, contentType?: string) {
    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: fileName,
      Body: file,
      ACL: 'public-read',
      ContentType: contentType,
    });

    await this.s3Client.send(command);

    return true;
  }
}
