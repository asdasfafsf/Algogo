import { registerAs } from '@nestjs/config';

export default registerAs('encryptConfig', () => ({
  currentKey: process.env.CURRENT_ENCRYPT_KEY,
  currentIv: process.env.CURRENT_ENCRYTPE_IV,
  prevKey: process.env.PREV_ENCRYPT_KEY,
  prevIv: process.env.PREV_ENCRYPT_IV,
}));
