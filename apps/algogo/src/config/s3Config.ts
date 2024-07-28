import { registerAs } from '@nestjs/config';

export default registerAs('s3Config', () => ({
  secretKey: process.env.S3_SECRET_KEY,
  accessKey: process.env.S3_ACCESS_KEY,
  bucketName: process.env.S3_PROBLEM_BUCKET_NAME,
  region: process.env.S3_REGION,
}));
