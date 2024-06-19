import { registerAs } from '@nestjs/config';

export default registerAs('crawler', () => ({
  url: process.env.CRAWLER_URL,
}));
