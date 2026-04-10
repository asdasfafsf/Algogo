import { registerAs } from '@nestjs/config';

export default registerAs('appConfig', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  frontendUrl: process.env.FRONTEND_URL ?? '',
}));
