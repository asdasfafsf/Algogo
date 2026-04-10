import { registerAs } from '@nestjs/config';

export default registerAs('tempoConfig', () => ({
  enabled: process.env.TEMPO_ENABLED === 'true',
  endpoint: process.env.TEMPO_ENDPOINT ?? '',
  authHeader: process.env.TEMPO_AUTH_HEADER ?? '',
}));
