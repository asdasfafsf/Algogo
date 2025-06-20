import { registerAs } from '@nestjs/config';

export default registerAs('wsConfig', () => ({
  wsTag: process.env.WS_TAG,
}));
