import { registerAs } from '@nestjs/config';

export default registerAs('LoggerConfig', () => ({
  level:
    process.env.NODE_ENV === 'production'
      ? 'info'
      : (process.env.LOG_LEVEL ?? 'info'),
}));
