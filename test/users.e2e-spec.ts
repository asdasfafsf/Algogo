import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, closeTestApp } from './helpers/setup';
import { getAccessToken, createAuthHeaders } from './helpers/auth';
import { seedTestUser, cleanDatabase } from './helpers/seed';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Users E2E', () => {
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

  describe('GET /users/:uuid', () => {
    it('존재하는 유저 UUID 로 200과 유저 정보를 반환한다', async () => {
      // Given
      const caller = await seedTestUser(prisma);
      const target = await seedTestUser(prisma, {
        name: 'target-user',
        email: 'target@test.com',
      });
      const accessToken = await getAccessToken(app, {
        sub: caller.uuid,
        roles: [],
      });

      // When
      const res = await request(app.getHttpServer())
        .get(`/users/${target.uuid}`)
        .set(createAuthHeaders(accessToken))
        .expect(200);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 200,
        errorCode: '0000',
        errorMessage: '',
      });
      expect(res.body.data).toMatchObject({
        uuid: target.uuid,
        name: 'target-user',
        email: 'target@test.com',
        profilePhoto: '',
      });
    });

    it('존재하지 않는 UUID 이면 404 USER_NOT_FOUND 를 반환한다', async () => {
      // Given
      const caller = await seedTestUser(prisma);
      const accessToken = await getAccessToken(app, {
        sub: caller.uuid,
        roles: [],
      });
      const nonExistentUuid = '00000000-0000-0000-0000-000000000000';

      // When
      const res = await request(app.getHttpServer())
        .get(`/users/${nonExistentUuid}`)
        .set(createAuthHeaders(accessToken))
        .expect(404);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 404,
        errorCode: 'USER_NOT_FOUND',
      });
    });

    it('잘못된 형식의 UUID 이면 404 USER_NOT_FOUND 를 반환한다', async () => {
      // Given
      const caller = await seedTestUser(prisma);
      const accessToken = await getAccessToken(app, {
        sub: caller.uuid,
        roles: [],
      });

      // When
      const res = await request(app.getHttpServer())
        .get('/users/not-a-valid-uuid')
        .set(createAuthHeaders(accessToken))
        .expect(404);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 404,
        errorCode: 'USER_NOT_FOUND',
      });
    });

    it('토큰이 없으면 401 JWT_MISSING 을 반환한다', async () => {
      // Given
      const target = await seedTestUser(prisma);

      // When
      const res = await request(app.getHttpServer())
        .get(`/users/${target.uuid}`)
        .expect(401);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 401,
        errorCode: 'JWT_MISSING',
      });
    });

    it('비활성 유저를 조회해도 200 을 반환한다', async () => {
      // Given
      const caller = await seedTestUser(prisma);
      const inactiveUser = await seedTestUser(prisma, {
        state: 'INACTIVE',
        name: 'inactive-user',
      });
      const accessToken = await getAccessToken(app, {
        sub: caller.uuid,
        roles: [],
      });

      // When
      const res = await request(app.getHttpServer())
        .get(`/users/${inactiveUser.uuid}`)
        .set(createAuthHeaders(accessToken))
        .expect(200);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 200,
        errorCode: '0000',
        errorMessage: '',
      });
      expect(res.body.data).toMatchObject({
        uuid: inactiveUser.uuid,
        name: 'inactive-user',
      });
    });
  });
});
