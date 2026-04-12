import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, closeTestApp } from './helpers/setup';
import { getAccessToken, createAuthHeaders } from './helpers/auth';
import { seedTestUser, cleanDatabase } from './helpers/seed';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '../src/jwt/jwt.service';

describe('Me E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const { app: testApp } = await createTestApp();
    app = testApp;
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  afterEach(async () => {
    await cleanDatabase(prisma);
  });

  describe('GET /api/v1/me', () => {
    it('유효한 토큰과 정상 유저로 200과 내 정보를 반환한다', async () => {
      // Given
      const user = await seedTestUser(prisma, {
        name: 'test-user',
        email: 'me@test.com',
      });
      const accessToken = await getAccessToken(app, {
        sub: user.uuid,
        roles: [],
      });

      // When
      const res = await request(app.getHttpServer())
        .get('/api/v1/me')
        .set(createAuthHeaders(accessToken))
        .expect(200);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 200,
        errorCode: '0000',
        errorMessage: '',
      });
      expect(res.body.data).toMatchObject({
        uuid: user.uuid,
        name: 'test-user',
        email: 'me@test.com',
        profilePhoto: '',
      });
      expect(Array.isArray(res.body.data.socialList)).toBe(true);
      expect(Array.isArray(res.body.data.oauthList)).toBe(true);
    });

    it('토큰이 없으면 401 JWT_MISSING 을 반환한다', async () => {
      // When
      const res = await request(app.getHttpServer())
        .get('/api/v1/me')
        .expect(401);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 401,
        errorCode: 'JWT_MISSING',
      });
    });

    it('만료된 토큰이면 401 JWT_EXPIRED 를 반환한다', async () => {
      // Given
      const user = await seedTestUser(prisma);
      const jwtService = app.get(JwtService);
      const expiredToken = await jwtService.sign(
        { sub: user.uuid, roles: [] },
        0,
      );

      await new Promise((resolve) => setTimeout(resolve, 1100));

      // When
      const res = await request(app.getHttpServer())
        .get('/api/v1/me')
        .set(createAuthHeaders(expiredToken))
        .expect(401);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 401,
        errorCode: 'JWT_EXPIRED',
      });
    });

    it('DB에 없는 UUID 토큰이면 404 USER_NOT_FOUND 를 반환한다', async () => {
      // Given
      const nonExistentUuid = '00000000-0000-0000-0000-000000000000';
      const accessToken = await getAccessToken(app, {
        sub: nonExistentUuid,
        roles: [],
      });

      // When
      const res = await request(app.getHttpServer())
        .get('/api/v1/me')
        .set(createAuthHeaders(accessToken))
        .expect(404);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 404,
        errorCode: 'USER_NOT_FOUND',
      });
    });

    it('socialList 와 oauthList 가 비어있는 유저는 빈 배열을 반환한다', async () => {
      // Given
      const user = await seedTestUser(prisma);
      const accessToken = await getAccessToken(app, {
        sub: user.uuid,
        roles: [],
      });

      // When
      const res = await request(app.getHttpServer())
        .get('/api/v1/me')
        .set(createAuthHeaders(accessToken))
        .expect(200);

      // Then
      expect(res.body.data.socialList).toEqual([]);
      expect(res.body.data.oauthList).toEqual([]);
    });
  });

  describe('PATCH /api/v1/me/profile', () => {
    it('이름만 변경하면 200과 업데이트된 정보를 반환한다', async () => {
      // Given
      const user = await seedTestUser(prisma, { name: 'old-name' });
      const accessToken = await getAccessToken(app, {
        sub: user.uuid,
        roles: [],
      });

      // When
      const res = await request(app.getHttpServer())
        .patch('/api/v1/me/profile')
        .set(createAuthHeaders(accessToken))
        .field('name', 'new-name')
        .expect(200);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 200,
        errorCode: '0000',
        errorMessage: '',
      });
      expect(res.body.data.name).toBe('new-name');
      expect(res.body.data.uuid).toBe(user.uuid);
    });

    it('body 가 비어있으면 200과 기존 정보를 반환한다', async () => {
      // Given
      const user = await seedTestUser(prisma, { name: 'keep-name' });
      const accessToken = await getAccessToken(app, {
        sub: user.uuid,
        roles: [],
      });

      // When
      const res = await request(app.getHttpServer())
        .patch('/api/v1/me/profile')
        .set(createAuthHeaders(accessToken))
        .expect(200);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 200,
        errorCode: '0000',
        errorMessage: '',
      });
      expect(res.body.data.name).toBe('keep-name');
    });

    it('토큰이 없으면 401 JWT_MISSING 을 반환한다', async () => {
      // When
      const res = await request(app.getHttpServer())
        .patch('/api/v1/me/profile')
        .expect(401);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 401,
        errorCode: 'JWT_MISSING',
      });
    });
  });
});
