import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  createTestApp,
  closeTestApp,
  cleanDatabase,
  seedTestUser,
  getAccessToken,
} from './helpers';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    const prisma = app.get(PrismaService);
    await cleanDatabase(prisma);
    await closeTestApp(app);
  });

  describe('인프라 검증', () => {
    it('앱이 정상적으로 시작된다', () => {
      expect(app).toBeDefined();
    });

    it('인증 없는 요청은 401을 반환한다', () => {
      return request(app.getHttpServer())
        .get('/api/v1/me')
        .expect(401);
    });

    it('유효한 토큰으로 인증된 요청이 동작한다', async () => {
      const prisma = app.get(PrismaService);
      const user = await seedTestUser(prisma);
      const token = await getAccessToken(app, {
        sub: user.uuid,
        roles: [],
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('statusCode', 200);
      expect(response.body).toHaveProperty('errorCode', '0000');
      expect(response.body).toHaveProperty('data');
    });

    it('응답 형식이 올바르다 (ResponseInterceptor)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/me')
        .expect(401);

      expect(response.body).toHaveProperty('statusCode');
      expect(response.body).toHaveProperty('errorCode');
      expect(response.body).toHaveProperty('errorMessage');
    });
  });
});
