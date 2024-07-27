import { registerAs } from '@nestjs/config';

export default registerAs('encryptConfig', () => ({
  key: process.env.ENCRYPT_KEY,
  iv: process.env.ENCRYTPE_IV,
  tag: process.env.ENCRYPT_TAG,
  prevKey: process.env.PREV_ENCRYPT_KEY,
  prevIv: process.env.PREV_ENCRYPT_IV,
  prevTag: process.env.PREV_ENCRYPT_TAG,
}));
