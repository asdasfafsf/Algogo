import { registerAs } from '@nestjs/config';

export default registerAs('jwtConfig', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  jwtRefreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  prevJwtSecret: process.env.PREV_JWT_SECRET,
}));
