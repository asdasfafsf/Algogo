import { registerAs } from '@nestjs/config';

export default registerAs('defaultConfig', () => ({
  tmpDir: process.env.TMP_DIR,
}));
