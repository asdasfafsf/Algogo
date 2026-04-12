import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, closeTestApp } from './helpers/setup';
import { getAccessToken, createAuthHeaders } from './helpers/auth';
import {
  seedTestUser,
  seedTestUserWithRoles,
  cleanDatabase,
} from './helpers/seed';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ProblemSite E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const { app: testApp } = await createTestApp();
    app = testApp;
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await closeTestApp(app);
  });

  afterEach(async () => {
    await cleanDatabase(prisma);
  });

  // ─── 헬퍼 ──────────────────────────────────────────────────

  async function createVipUserAndToken() {
    const user = await seedTestUserWithRoles(prisma, ['VIP']);
    const token = await getAccessToken(app, {
      sub: user.uuid,
      roles: ['VIP'],
    });
    return { user, token, headers: createAuthHeaders(token) };
  }

  async function createAdminUserAndToken() {
    const user = await seedTestUserWithRoles(prisma, ['ADMIN']);
    const token = await getAccessToken(app, {
      sub: user.uuid,
      roles: ['ADMIN'],
    });
    return { user, token, headers: createAuthHeaders(token) };
  }

  async function createRegularUserAndToken() {
    const user = await seedTestUser(prisma);
    const token = await getAccessToken(app, {
      sub: user.uuid,
      roles: [],
    });
    return { user, token, headers: createAuthHeaders(token) };
  }

  // ─── POST /api/v1/problem-site ────────────────────────────

  describe('POST /api/v1/problem-site', () => {
    it('VIP 유저가 유효한 provider/handle 로 요청하면 201을 반환한다', async () => {
      // Given
      const { headers } = await createVipUserAndToken();

      // When
      const res = await request(app.getHttpServer())
        .post('/api/v1/problem-site')
        .set(headers)
        .send({ provider: 'BOJ', handle: 'test_handle' })
        .expect(201);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 201,
        errorCode: '0000',
        errorMessage: '',
      });
      expect(res.body.data).toMatchObject({
        provider: 'BOJ',
        handle: 'test_handle',
      });
      expect(res.body.data).toHaveProperty('userUuid');
      expect(res.body.data).toHaveProperty('createdAt');
    });

    it('ADMIN 유저가 요청하면 201을 반환한다', async () => {
      // Given
      const { headers } = await createAdminUserAndToken();

      // When
      const res = await request(app.getHttpServer())
        .post('/api/v1/problem-site')
        .set(headers)
        .send({ provider: 'BOJ', handle: 'admin_handle' })
        .expect(201);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 201,
        errorCode: '0000',
        errorMessage: '',
      });
      expect(res.body.data).toMatchObject({
        provider: 'BOJ',
        handle: 'admin_handle',
      });
    });

    it('일반 유저(권한 없음)가 요청하면 403 FORBIDDEN을 반환한다', async () => {
      // Given
      const { headers } = await createRegularUserAndToken();

      // When
      const res = await request(app.getHttpServer())
        .post('/api/v1/problem-site')
        .set(headers)
        .send({ provider: 'BOJ', handle: 'regular_handle' })
        .expect(403);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 403,
        errorCode: 'FORBIDDEN',
      });
    });

    it('비로그인 상태에서 요청하면 401 JWT_MISSING을 반환한다', async () => {
      // When
      const res = await request(app.getHttpServer())
        .post('/api/v1/problem-site')
        .send({ provider: 'BOJ', handle: 'no_auth_handle' })
        .expect(401);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 401,
        errorCode: 'JWT_MISSING',
      });
    });

    it('같은 provider로 중복 생성 시 에러를 반환한다', async () => {
      // Given
      const { user, headers } = await createVipUserAndToken();
      await prisma.problemSiteAccount.create({
        data: {
          userUuid: user.uuid,
          provider: 'BOJ',
          handle: 'existing_handle',
        },
      });

      // When
      const res = await request(app.getHttpServer())
        .post('/api/v1/problem-site')
        .set(headers)
        .send({ provider: 'BOJ', handle: 'new_handle' });

      // Then -- unique constraint (userUuid+provider) 위반
      expect(res.body.statusCode).toBeGreaterThanOrEqual(400);
    });

    it('provider가 빈 값이면 400을 반환한다', async () => {
      // Given
      const { headers } = await createVipUserAndToken();

      // When
      const res = await request(app.getHttpServer())
        .post('/api/v1/problem-site')
        .set(headers)
        .send({ provider: '', handle: 'test_handle' })
        .expect(400);

      // Then
      expect(res.body.statusCode).toBe(400);
    });

    it('handle이 빈 값이면 400을 반환한다', async () => {
      // Given
      const { headers } = await createVipUserAndToken();

      // When
      const res = await request(app.getHttpServer())
        .post('/api/v1/problem-site')
        .set(headers)
        .send({ provider: 'BOJ', handle: '' })
        .expect(400);

      // Then
      expect(res.body.statusCode).toBe(400);
    });

    it('provider와 handle 모두 누락이면 400을 반환한다', async () => {
      // Given
      const { headers } = await createVipUserAndToken();

      // When
      const res = await request(app.getHttpServer())
        .post('/api/v1/problem-site')
        .set(headers)
        .send({})
        .expect(400);

      // Then
      expect(res.body.statusCode).toBe(400);
    });
  });

  // ─── DELETE /api/v1/problem-site/:provider ─────────────────

  describe('DELETE /api/v1/problem-site/:provider', () => {
    it('연동된 provider를 삭제하면 200을 반환한다', async () => {
      // Given
      const { user, headers } = await createVipUserAndToken();
      await prisma.problemSiteAccount.create({
        data: {
          userUuid: user.uuid,
          provider: 'BOJ',
          handle: 'to_delete_handle',
        },
      });

      // When
      const res = await request(app.getHttpServer())
        .delete('/api/v1/problem-site/BOJ')
        .set(headers)
        .expect(200);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 200,
        errorCode: '0000',
        errorMessage: '',
      });
    });

    it('연동되지 않은 provider를 삭제하면 에러를 반환한다', async () => {
      // Given
      const { headers } = await createVipUserAndToken();

      // When
      const res = await request(app.getHttpServer())
        .delete('/api/v1/problem-site/BOJ')
        .set(headers);

      // Then -- Prisma P2025: record not found
      expect(res.body.statusCode).toBeGreaterThanOrEqual(400);
    });

    it('일반 유저가 삭제 요청하면 403 FORBIDDEN을 반환한다', async () => {
      // Given
      const { headers } = await createRegularUserAndToken();

      // When
      const res = await request(app.getHttpServer())
        .delete('/api/v1/problem-site/BOJ')
        .set(headers)
        .expect(403);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 403,
        errorCode: 'FORBIDDEN',
      });
    });

    it('비로그인 상태에서 삭제 요청하면 401 JWT_MISSING을 반환한다', async () => {
      // When
      const res = await request(app.getHttpServer())
        .delete('/api/v1/problem-site/BOJ')
        .expect(401);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 401,
        errorCode: 'JWT_MISSING',
      });
    });
  });
});
