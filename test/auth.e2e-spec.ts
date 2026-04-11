import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createTestApp, closeTestApp } from './helpers/setup';
import {
  getAccessToken,
  getRefreshToken,
  createAuthHeaders,
  createAuthCookies,
} from './helpers/auth';
import { seedTestUser, cleanDatabase } from './helpers/seed';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '../src/jwt/jwt.service';

describe('Auth E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cache: Cache;

  const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000 + 10000; // jwtRefreshTokenExpiresIn * 1000 + 10000

  async function loginTestUser(
    overrides?: Partial<{
      uuid: string;
      email: string;
      name: string;
      state: string;
    }>,
  ) {
    const user = await seedTestUser(prisma, overrides);
    const accessToken = await getAccessToken(app, {
      sub: user.uuid,
      roles: [],
    });
    const refreshToken = await getRefreshToken(app, { sub: user.uuid });

    await cache.set(
      `${user.uuid}:${refreshToken}`,
      true,
      REFRESH_TOKEN_TTL_MS,
    );

    return { user, accessToken, refreshToken };
  }

  beforeAll(async () => {
    const { app: testApp } = await createTestApp();
    app = testApp;
    prisma = app.get(PrismaService);
    cache = app.get<Cache>(CACHE_MANAGER);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  afterEach(async () => {
    await cleanDatabase(prisma);
  });

  describe('POST /api/v2/auth/refresh', () => {
    it('유효한 refresh token (쿠키) 으로 새 토큰 쌍을 반환한다', async () => {
      // Given
      const { refreshToken } = await loginTestUser();

      // When
      const res = await request(app.getHttpServer())
        .post('/api/v2/auth/refresh')
        .set('Cookie', createAuthCookies('', refreshToken))
        .expect(200);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 200,
        errorCode: '0000',
        errorMessage: '',
      });
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(typeof res.body.data.accessToken).toBe('string');
      expect(typeof res.body.data.refreshToken).toBe('string');

      // 쿠키에 새 토큰이 설정되었는지 확인
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(cookieStr).toContain('access_token=');
      expect(cookieStr).toContain('refresh_token=');
    });

    it('유효한 refresh token (Authorization 헤더) 으로 새 토큰 쌍을 반환한다', async () => {
      // Given
      const { refreshToken } = await loginTestUser();

      // When
      const res = await request(app.getHttpServer())
        .post('/api/v2/auth/refresh')
        .set(createAuthHeaders(refreshToken))
        .expect(200);

      // Then
      expect(res.body.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('refresh token 이 없으면 401 JWT_MISSING 을 반환한다', async () => {
      // When
      const res = await request(app.getHttpServer())
        .post('/api/v2/auth/refresh')
        .expect(401);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 401,
        errorCode: 'JWT_MISSING',
      });
    });

    it('만료된 refresh token 이면 401 JWT_EXPIRED 를 반환한다', async () => {
      // Given
      const user = await seedTestUser(prisma);
      const jwtService = app.get(JwtService);
      // expiresIn 0초로 이미 만료된 토큰 생성
      const expiredToken = await jwtService.sign({ sub: user.uuid }, 0);

      // 즉시 만료되므로 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // When
      const res = await request(app.getHttpServer())
        .post('/api/v2/auth/refresh')
        .set('Cookie', `refresh_token=${expiredToken}`)
        .expect(401);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 401,
        errorCode: 'JWT_EXPIRED',
      });
    });

    it('변조된 refresh token 이면 401 JWT_INVALID 를 반환한다', async () => {
      // Given
      const tamperedToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNjE2MjM5MDIyfQ.invalid_signature';

      // When
      const res = await request(app.getHttpServer())
        .post('/api/v2/auth/refresh')
        .set('Cookie', `refresh_token=${tamperedToken}`)
        .expect(401);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 401,
        errorCode: 'JWT_INVALID',
      });
    });

    it('유효한 JWT 이지만 Redis 에 없는 refresh token 이면 401 JWT_INVALID 를 반환한다', async () => {
      // Given
      const user = await seedTestUser(prisma);
      const refreshToken = await getRefreshToken(app, { sub: user.uuid });
      // Redis에 저장하지 않음

      // When
      const res = await request(app.getHttpServer())
        .post('/api/v2/auth/refresh')
        .set('Cookie', `refresh_token=${refreshToken}`)
        .expect(401);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 401,
        errorCode: 'JWT_INVALID',
      });
    });

    it('유효한 토큰이지만 유저가 삭제되었으면 404 USER_NOT_FOUND 를 반환한다', async () => {
      // Given
      const { refreshToken } = await loginTestUser();

      // 유저 삭제
      await cleanDatabase(prisma);

      // When
      const res = await request(app.getHttpServer())
        .post('/api/v2/auth/refresh')
        .set('Cookie', `refresh_token=${refreshToken}`)
        .expect(404);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 404,
        errorCode: 'USER_NOT_FOUND',
      });
    });

    it('유효한 토큰이지만 유저가 비활성이면 403 USER_INACTIVE 를 반환한다', async () => {
      // Given
      const { refreshToken } = await loginTestUser({ state: 'INACTIVE' });

      // When
      const res = await request(app.getHttpServer())
        .post('/api/v2/auth/refresh')
        .set('Cookie', `refresh_token=${refreshToken}`)
        .expect(403);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 403,
        errorCode: 'USER_INACTIVE',
      });
    });

    it('refresh 후 이전 refresh token 을 재사용하면 401 JWT_INVALID 를 반환한다 (token rotation)', async () => {
      // Given
      const { refreshToken: oldRefreshToken } = await loginTestUser();

      // 첫 번째 refresh 성공
      await request(app.getHttpServer())
        .post('/api/v2/auth/refresh')
        .set('Cookie', `refresh_token=${oldRefreshToken}`)
        .expect(200);

      // When — 이전 토큰으로 다시 refresh 시도
      const res = await request(app.getHttpServer())
        .post('/api/v2/auth/refresh')
        .set('Cookie', `refresh_token=${oldRefreshToken}`)
        .expect(401);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 401,
        errorCode: 'JWT_INVALID',
      });
    });

    it('refresh 후 새 토큰으로 다시 refresh 에 성공한다', async () => {
      // Given
      const { refreshToken: firstRefreshToken } = await loginTestUser();

      // 첫 번째 refresh
      const firstRes = await request(app.getHttpServer())
        .post('/api/v2/auth/refresh')
        .set('Cookie', `refresh_token=${firstRefreshToken}`)
        .expect(200);

      const newRefreshToken = firstRes.body.data.refreshToken;

      // 새 refresh token 을 Redis 에 저장 (서비스가 이미 저장하므로 별도 저장 불필요)
      // When — 새 토큰으로 두 번째 refresh
      const secondRes = await request(app.getHttpServer())
        .post('/api/v2/auth/refresh')
        .set('Cookie', `refresh_token=${newRefreshToken}`)
        .expect(200);

      // Then
      expect(secondRes.body.statusCode).toBe(200);
      expect(secondRes.body.data).toHaveProperty('accessToken');
      expect(secondRes.body.data).toHaveProperty('refreshToken');
      expect(secondRes.body.data.refreshToken).not.toBe(newRefreshToken);
    });
  });

  describe('POST /api/v2/auth/logout', () => {
    it('유효한 access token + refresh token 쿠키로 로그아웃에 성공한다', async () => {
      // Given
      const { accessToken, refreshToken } = await loginTestUser();

      // When
      const res = await request(app.getHttpServer())
        .post('/api/v2/auth/logout')
        .set('Cookie', createAuthCookies(accessToken, refreshToken))
        .expect(200);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 200,
        errorCode: '0000',
        errorMessage: '',
      });

      // 쿠키가 클리어되었는지 확인
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(cookieStr).toContain('access_token=');
      expect(cookieStr).toContain('refresh_token=');
    });

    it('access token 이 없으면 401 JWT_MISSING 을 반환한다', async () => {
      // When
      const res = await request(app.getHttpServer())
        .post('/api/v2/auth/logout')
        .expect(401);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 401,
        errorCode: 'JWT_MISSING',
      });
    });

    it('만료된 access token 이면 401 JWT_EXPIRED 를 반환한다', async () => {
      // Given
      const jwtService = app.get(JwtService);
      const user = await seedTestUser(prisma);
      const expiredAccessToken = await jwtService.sign(
        { sub: user.uuid, roles: [] },
        0,
      );

      // 만료 대기
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // When
      const res = await request(app.getHttpServer())
        .post('/api/v2/auth/logout')
        .set('Cookie', `access_token=${expiredAccessToken}`)
        .expect(401);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 401,
        errorCode: 'JWT_EXPIRED',
      });
    });

    it('로그아웃 후 같은 refresh token 으로 refresh 시도하면 401 JWT_INVALID 를 반환한다', async () => {
      // Given
      const { accessToken, refreshToken } = await loginTestUser();

      // 로그아웃
      await request(app.getHttpServer())
        .post('/api/v2/auth/logout')
        .set('Cookie', createAuthCookies(accessToken, refreshToken))
        .expect(200);

      // When — 로그아웃 후 refresh 시도
      const res = await request(app.getHttpServer())
        .post('/api/v2/auth/refresh')
        .set('Cookie', `refresh_token=${refreshToken}`)
        .expect(401);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 401,
        errorCode: 'JWT_INVALID',
      });
    });
  });
});
