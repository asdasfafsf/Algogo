import { registerAs } from '@nestjs/config';

export default registerAs('crawlerConfig', () => ({
  url: process.env.CRAWLER_URL,
}));
