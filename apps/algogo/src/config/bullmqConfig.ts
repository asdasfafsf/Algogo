import { registerAs } from '@nestjs/config';

export default registerAs('bullmqConfig', () => ({
  host: process.env.BULLMQ_HOST,
  port: Number(process.env.BULLMQ_PORT),
  password: process.env.BULLMQ_PASSWORD,
  queueName: process.env.BULLMQ_QUEUE_NAME,
}));
