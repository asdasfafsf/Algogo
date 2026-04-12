import {
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, closeTestApp } from './helpers/setup';
import { getAccessToken, createAuthHeaders } from './helpers/auth';
import { seedTestUser, cleanDatabase } from './helpers/seed';
import { PrismaService } from '../src/prisma/prisma.service';
import { DynamicOAuthGuard } from '../src/oauth-v2/dynamic-oauth.guard';
import { OAuthRequestUser } from '../src/common/types/oauth.type';
import { OAUTH_PROVIDER } from '../src/common/constants/oauth.contant';

let mockOAuthProfile: OAuthRequestUser;

const MockDynamicOAuthGuard: CanActivate = {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.oauth = mockOAuthProfile;
    return true;
  },
};

describe('OAuth E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const { app: testApp } = await createTestApp({
      overrideGuards: [
        { guard: DynamicOAuthGuard, mockValue: MockDynamicOAuthGuard },
      ],
    });
    app = testApp;
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  afterEach(async () => {
    await cleanDatabase(prisma);
  });

  describe('POST /api/v2/oauth/:provider (로그인/회원가입)', () => {
    const PROVIDER = OAUTH_PROVIDER.GOOGLE;
    const BASE_PROFILE: OAuthRequestUser = {
      provider: PROVIDER,
      id: 'oauth-test-id-001',
      name: '테스트유저',
      email: 'oauth-test@test.com',
      accessToken: 'mock-access-token',
    };

    beforeEach(() => {
      mockOAuthProfile = { ...BASE_PROFILE };
    });

    it('신규 유저는 회원가입 후 토큰을 발급받는다', async () => {
      // Given — DB에 해당 OAuth 레코드 없음 (NEW 상태)

      // When
      const res = await request(app.getHttpServer())
        .post(`/api/v2/oauth/${PROVIDER}`)
        .expect(201);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 201,
        errorCode: '0000',
        errorMessage: '',
      });
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(typeof res.body.data.accessToken).toBe('string');
      expect(typeof res.body.data.refreshToken).toBe('string');

      // 쿠키에 토큰이 설정되었는지 확인
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(cookieStr).toContain('access_token=');
      expect(cookieStr).toContain('refresh_token=');
    });

    it('신규 가입 후 DB에 유저와 OAuth 레코드가 생성된다', async () => {
      // Given — 신규 유저

      // When
      await request(app.getHttpServer())
        .post(`/api/v2/oauth/${PROVIDER}`)
        .expect(201);

      // Then — DB에 UserOAuth 레코드가 존재
      const oauthRecord = await prisma.userOAuth.findUnique({
        where: {
          id_provider: {
            id: BASE_PROFILE.id,
            provider: PROVIDER,
          },
        },
      });
      expect(oauthRecord).not.toBeNull();
      expect(oauthRecord!.isActive).toBe(true);

      // 유저도 생성되었는지 확인
      const user = await prisma.user.findUnique({
        where: { uuid: oauthRecord!.userUuid },
      });
      expect(user).not.toBeNull();
      expect(user!.email).toBe(BASE_PROFILE.email);
    });

    it('기존 유저 활성 OAuth 상태이면 로그인 토큰을 반환한다', async () => {
      // Given — CONNECTED_AND_ACTIVE 상태
      const user = await seedTestUser(prisma);
      await prisma.userOAuth.create({
        data: {
          userUuid: user.uuid,
          id: BASE_PROFILE.id,
          provider: PROVIDER,
          isActive: true,
        },
      });

      // When
      const res = await request(app.getHttpServer())
        .post(`/api/v2/oauth/${PROVIDER}`)
        .expect(201);

      // Then
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('비활성 OAuth 상태이면 재활성화 후 로그인한다', async () => {
      // Given — CONNECTED_AND_INACTIVE 상태
      const user = await seedTestUser(prisma);
      await prisma.userOAuth.create({
        data: {
          userUuid: user.uuid,
          id: BASE_PROFILE.id,
          provider: PROVIDER,
          isActive: false,
        },
      });

      // When
      const res = await request(app.getHttpServer())
        .post(`/api/v2/oauth/${PROVIDER}`)
        .expect(201);

      // Then
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');

      // OAuth 레코드가 재활성화되었는지 확인
      const oauthRecord = await prisma.userOAuth.findUnique({
        where: {
          id_provider: {
            id: BASE_PROFILE.id,
            provider: PROVIDER,
          },
        },
      });
      expect(oauthRecord!.isActive).toBe(true);
    });

    it('다른 계정에 활성 연결된 OAuth이면 해당 계정으로 로그인한다', async () => {
      // Given — CONNECTED_TO_OTHER_ACCOUNT 상태
      const otherUser = await seedTestUser(prisma, {
        email: 'other@test.com',
      });
      await prisma.userOAuth.create({
        data: {
          userUuid: otherUser.uuid,
          id: BASE_PROFILE.id,
          provider: PROVIDER,
          isActive: true,
        },
      });

      // When
      const res = await request(app.getHttpServer())
        .post(`/api/v2/oauth/${PROVIDER}`)
        .expect(201);

      // Then
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('다른 계정에 비활성 연결된 OAuth이면 재활성화 후 로그인한다', async () => {
      // Given — DISCONNECTED_FROM_OTHER_ACCOUNT 상태
      const otherUser = await seedTestUser(prisma, {
        email: 'other2@test.com',
      });
      await prisma.userOAuth.create({
        data: {
          userUuid: otherUser.uuid,
          id: BASE_PROFILE.id,
          provider: PROVIDER,
          isActive: false,
        },
      });

      // When
      const res = await request(app.getHttpServer())
        .post(`/api/v2/oauth/${PROVIDER}`)
        .expect(201);

      // Then
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');

      // 재활성화 확인
      const oauthRecord = await prisma.userOAuth.findUnique({
        where: {
          id_provider: {
            id: BASE_PROFILE.id,
            provider: PROVIDER,
          },
        },
      });
      expect(oauthRecord!.isActive).toBe(true);
    });
  });

  describe('POST /api/v2/oauth/connect/:provider (OAuth 연동)', () => {
    const PROVIDER = OAUTH_PROVIDER.GOOGLE;
    const CONNECT_PROFILE: OAuthRequestUser = {
      provider: PROVIDER,
      id: 'connect-test-id-001',
      name: '연동테스트',
      email: 'connect-test@test.com',
      accessToken: 'mock-connect-token',
    };

    beforeEach(() => {
      mockOAuthProfile = { ...CONNECT_PROFILE };
    });

    it('로그인 상태에서 새 OAuth를 연결한다', async () => {
      // Given
      const user = await seedTestUser(prisma);
      const accessToken = await getAccessToken(app, {
        sub: user.uuid,
        roles: [],
      });

      // When
      const res = await request(app.getHttpServer())
        .post(`/api/v2/oauth/connect/${PROVIDER}`)
        .set(createAuthHeaders(accessToken))
        .expect(201);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 201,
        errorCode: '0000',
      });

      // DB에 OAuth 레코드가 생성되었는지 확인
      const oauthRecord = await prisma.userOAuth.findUnique({
        where: {
          id_provider: {
            id: CONNECT_PROFILE.id,
            provider: PROVIDER,
          },
        },
      });
      expect(oauthRecord).not.toBeNull();
      expect(oauthRecord!.userUuid).toBe(user.uuid);
      expect(oauthRecord!.isActive).toBe(true);
    });

    it('이미 내 계정에 활성 연결된 OAuth이면 멱등하게 처리한다', async () => {
      // Given — CONNECTED_AND_ACTIVE 상태 (내 계정)
      const user = await seedTestUser(prisma);
      await prisma.userOAuth.create({
        data: {
          userUuid: user.uuid,
          id: CONNECT_PROFILE.id,
          provider: PROVIDER,
          isActive: true,
        },
      });
      const accessToken = await getAccessToken(app, {
        sub: user.uuid,
        roles: [],
      });

      // When
      const res = await request(app.getHttpServer())
        .post(`/api/v2/oauth/connect/${PROVIDER}`)
        .set(createAuthHeaders(accessToken))
        .expect(201);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 201,
        errorCode: '0000',
      });
    });

    it('내 계정에 비활성 연결된 OAuth이면 재활성화한다', async () => {
      // Given — CONNECTED_AND_INACTIVE 상태 (내 계정)
      const user = await seedTestUser(prisma);
      await prisma.userOAuth.create({
        data: {
          userUuid: user.uuid,
          id: CONNECT_PROFILE.id,
          provider: PROVIDER,
          isActive: false,
        },
      });
      const accessToken = await getAccessToken(app, {
        sub: user.uuid,
        roles: [],
      });

      // When
      const res = await request(app.getHttpServer())
        .post(`/api/v2/oauth/connect/${PROVIDER}`)
        .set(createAuthHeaders(accessToken))
        .expect(201);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 201,
        errorCode: '0000',
      });

      // 재활성화 확인
      const oauthRecord = await prisma.userOAuth.findUnique({
        where: {
          id_provider: {
            id: CONNECT_PROFILE.id,
            provider: PROVIDER,
          },
        },
      });
      expect(oauthRecord!.isActive).toBe(true);
    });

    it('다른 유저에 연결된 OAuth이면 409 OAUTH_CONFLICT를 반환한다', async () => {
      // Given — CONNECTED_TO_OTHER_ACCOUNT 상태
      const myUser = await seedTestUser(prisma, {
        email: 'my-user@test.com',
      });
      const otherUser = await seedTestUser(prisma, {
        email: 'other-user@test.com',
      });
      await prisma.userOAuth.create({
        data: {
          userUuid: otherUser.uuid,
          id: CONNECT_PROFILE.id,
          provider: PROVIDER,
          isActive: true,
        },
      });
      const accessToken = await getAccessToken(app, {
        sub: myUser.uuid,
        roles: [],
      });

      // When
      const res = await request(app.getHttpServer())
        .post(`/api/v2/oauth/connect/${PROVIDER}`)
        .set(createAuthHeaders(accessToken))
        .expect(409);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 409,
        errorCode: 'OAUTH_CONFLICT',
      });
    });

    it('비로그인 상태이면 401 JWT_MISSING을 반환한다', async () => {
      // When — 토큰 없이 요청
      const res = await request(app.getHttpServer())
        .post(`/api/v2/oauth/connect/${PROVIDER}`)
        .expect(401);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 401,
        errorCode: 'JWT_MISSING',
      });
    });
  });

  describe('POST /api/v2/oauth/disconnect/:provider (OAuth 해제)', () => {
    const PROVIDER = OAUTH_PROVIDER.GOOGLE;
    const DISCONNECT_PROFILE: OAuthRequestUser = {
      provider: PROVIDER,
      id: 'disconnect-test-id-001',
      name: '해제테스트',
      email: 'disconnect-test@test.com',
      accessToken: 'mock-disconnect-token',
    };

    beforeEach(() => {
      mockOAuthProfile = { ...DISCONNECT_PROFILE };
    });

    it('내 계정에 연결된 OAuth를 해제한다', async () => {
      // Given
      const user = await seedTestUser(prisma);
      await prisma.userOAuth.create({
        data: {
          userUuid: user.uuid,
          id: DISCONNECT_PROFILE.id,
          provider: PROVIDER,
          isActive: true,
        },
      });
      const accessToken = await getAccessToken(app, {
        sub: user.uuid,
        roles: [],
      });

      // When
      const res = await request(app.getHttpServer())
        .post(`/api/v2/oauth/disconnect/${PROVIDER}`)
        .set(createAuthHeaders(accessToken))
        .expect(201);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 201,
        errorCode: '0000',
      });

      // OAuth 레코드가 비활성화되었는지 확인
      const oauthRecord = await prisma.userOAuth.findUnique({
        where: {
          id_provider: {
            id: DISCONNECT_PROFILE.id,
            provider: PROVIDER,
          },
        },
      });
      expect(oauthRecord!.isActive).toBe(false);
    });

    it('비로그인 상태이면 401 JWT_MISSING을 반환한다', async () => {
      // When — 토큰 없이 요청
      const res = await request(app.getHttpServer())
        .post(`/api/v2/oauth/disconnect/${PROVIDER}`)
        .expect(401);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 401,
        errorCode: 'JWT_MISSING',
      });
    });
  });
});
