import { registerAs } from '@nestjs/config';

export default registerAs('lokiConfig', () => ({
  host: process.env.LOKI_HOST ?? '',
  username: process.env.LOKI_USERNAME ?? '',
  password: process.env.LOKI_PASSWORD ?? '',
  enabled: process.env.LOKI_ENABLED === 'true',
}));
