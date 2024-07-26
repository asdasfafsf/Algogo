import { registerAs } from '@nestjs/config';

export default registerAs('jwtConfig', () => ({
  currentAccessTokenSecret: process.env.CURRENT_ACCESS_TOKEN_SECRET,
  currentRefreshTokenSecret: process.env.CURRENT_REFRESH_TOKEN_SECRET,
  prevAccessTokenSecret: process.env.PREV_ACCESS_TOKEN_SECRET,
  prevRefreshTokenSecret: process.env.PREV_CURRENT_TOKEN_SECRET,
}));
