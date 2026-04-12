import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, closeTestApp } from './helpers/setup';
import { getAccessToken, createAuthHeaders } from './helpers/auth';
import { seedTestUser, cleanDatabase } from './helpers/seed';
import { PrismaService } from '../src/prisma/prisma.service';
import { uuidv7 } from 'uuidv7';

describe('Problems V2 E2E', () => {
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

  // ─── 시드 헬퍼 ──────────────────────────────────────────────

  async function seedProblemWithType(
    overrides: Partial<{
      uuid: string;
      title: string;
      level: number;
      levelText: string;
      answerRate: number;
      submitCount: number;
    }>,
    typeNames: string[] = [],
  ) {
    const uuid = overrides.uuid ?? uuidv7();
    const problem = await prisma.problemV2.create({
      data: {
        uuid,
        title: overrides.title ?? 'test-problem',
        level: overrides.level ?? 1,
        levelText: overrides.levelText ?? 'Bronze V',
        answerRate: overrides.answerRate ?? 50.0,
        submitCount: overrides.submitCount ?? 100,
        timeout: 1000,
        memoryLimit: 256,
        answerCount: 50,
        answerPeopleCount: 50,
        source: 'baekjoon',
        sourceUrl: 'https://www.acmicpc.net/problem/1000',
        sourceId: `test-${uuid}`,
        content: '<p>test problem content</p>',
      },
    });

    for (const name of typeNames) {
      await prisma.problemV2Type.create({
        data: {
          name,
          problemUuid: uuid,
        },
      });
    }

    return problem;
  }

  async function seedTodayProblem(problemUuid: string, servedAt: Date) {
    return prisma.todayProblem.create({
      data: {
        problemUuid,
        servedAt,
      },
    });
  }

  async function seedUserProblemState(
    userUuid: string,
    problemUuid: string,
    state: string,
  ) {
    return prisma.userProblemState.create({
      data: {
        userUuid,
        problemUuid,
        state,
      },
    });
  }

  // ─── GET /api/v2/problems (목록) ─────────────────────────────

  describe('GET /api/v2/problems', () => {
    it('기본 조회 (파라미터 없음) — 200과 첫 페이지를 반환한다', async () => {
      // Given
      await seedProblemWithType({ title: '문제 A', level: 1 });
      await seedProblemWithType({ title: '문제 B', level: 2 });

      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems')
        .expect(200);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 200,
        errorCode: '0000',
        errorMessage: '',
      });
      expect(res.body.data.problemList).toBeInstanceOf(Array);
      expect(res.body.data.problemList.length).toBe(2);
    });

    it('pageNo=1, pageSize=10 — 200과 10개 이하를 반환한다', async () => {
      // Given
      for (let i = 0; i < 3; i++) {
        await seedProblemWithType({ title: `문제 ${i}`, level: i + 1 });
      }

      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems')
        .query({ pageNo: 1, pageSize: 10 })
        .expect(200);

      // Then
      expect(res.body.data.problemList.length).toBeLessThanOrEqual(10);
      expect(res.body.data.problemList.length).toBe(3);
    });

    it('pageSize 허용되지 않는 값 (15) — 400 validation error', async () => {
      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems')
        .query({ pageSize: 15 })
        .expect(400);

      // Then
      expect(res.body.statusCode).toBe(400);
      expect(res.body.errorMessage).toContain(
        '10, 20 또는 50 단위로만 조회가 가능합니다.',
      );
    });

    it('pageNo=-1 — 400 validation error', async () => {
      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems')
        .query({ pageNo: -1 })
        .expect(400);

      // Then
      expect(res.body.statusCode).toBe(400);
      expect(res.body.errorMessage).toContain(
        '페이지 번호는 0페이지보다 커야 합니다.',
      );
    });

    it('title 검색 — 2자 이상 일반 문자열로 검색하면 200과 결과를 반환한다', async () => {
      // Given
      await seedProblemWithType({ title: '피보나치 수열', level: 5 });
      await seedProblemWithType({ title: '하노이의 탑', level: 3 });

      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems')
        .query({ title: '피보나치' })
        .expect(200);

      // Then
      expect(res.body.statusCode).toBe(200);
      expect(res.body.data.problemList).toBeInstanceOf(Array);
    });

    it('title 검색 — 빈 문자열이면 200과 전체 목록을 반환한다', async () => {
      // Given
      await seedProblemWithType({ title: '문제 가' });
      await seedProblemWithType({ title: '문제 나' });

      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems')
        .query({ title: '' })
        .expect(200);

      // Then
      expect(res.body.statusCode).toBe(200);
      expect(res.body.data.problemList.length).toBe(2);
    });

    it('levelList 필터 — 해당 레벨 문제만 반환한다', async () => {
      // Given
      await seedProblemWithType({ title: '레벨1 문제', level: 1 });
      await seedProblemWithType({ title: '레벨5 문제', level: 5 });
      await seedProblemWithType({ title: '레벨10 문제', level: 10 });

      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems')
        .query({ 'levelList[]': [1, 5] })
        .expect(200);

      // Then
      expect(res.body.statusCode).toBe(200);
      const levels = res.body.data.problemList.map(
        (p: { level: number }) => p.level,
      );
      for (const level of levels) {
        expect([1, 5]).toContain(level);
      }
    });

    it('typeList 잘못된 값 — 400 validation error', async () => {
      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems')
        .query({ 'typeList[]': ['없는유형'] })
        .expect(400);

      // Then
      expect(res.body.statusCode).toBe(400);
      expect(res.body.errorMessage).toContain('올바른 문제 유형이 아닙니다');
    });

    it('sort 유효한 enum — 200을 반환한다', async () => {
      // Given
      await seedProblemWithType({ title: '문제 A', level: 1 });

      // When — sort=10 (TITLE_ASC)
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems')
        .query({ sort: 10 })
        .expect(200);

      // Then
      expect(res.body.statusCode).toBe(200);
    });

    it('sort 잘못된 값 — 400 validation error', async () => {
      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems')
        .query({ sort: 999 })
        .expect(400);

      // Then
      expect(res.body.statusCode).toBe(400);
      expect(res.body.errorMessage).toContain('올바른 정렬 방식이 아닙니다');
    });

    it('로그인 유저 — state가 매핑된다', async () => {
      // Given
      const user = await seedTestUser(prisma);
      const problem = await seedProblemWithType({
        title: '상태 문제',
        level: 1,
      });
      await seedUserProblemState(user.uuid, problem.uuid, 'SOLVED');
      const accessToken = await getAccessToken(app, {
        sub: user.uuid,
        roles: [],
      });

      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems')
        .set(createAuthHeaders(accessToken))
        .expect(200);

      // Then
      const found = res.body.data.problemList.find(
        (p: { uuid: string }) => p.uuid === problem.uuid,
      );
      expect(found).toBeDefined();
      expect(found.state).toBe('SOLVED');
    });

    it('비로그인 유저 — state가 전부 NONE이다', async () => {
      // Given
      await seedProblemWithType({ title: '문제 A', level: 1 });
      await seedProblemWithType({ title: '문제 B', level: 2 });

      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems')
        .expect(200);

      // Then
      for (const problem of res.body.data.problemList) {
        expect(problem.state).toBe('NONE');
      }
    });

    it('결과 0건인 검색 조건 — 200과 빈 배열을 반환한다', async () => {
      // Given
      await seedProblemWithType({ title: '문제 A', level: 1 });

      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems')
        .query({ 'levelList[]': [99] })
        .expect(200);

      // Then
      expect(res.body.statusCode).toBe(200);
      expect(res.body.data.problemList).toEqual([]);
      expect(res.body.data.totalCount).toBe(0);
    });
  });

  // ─── GET /api/v2/problems/today (오늘의 문제) ────────────────

  describe('GET /api/v2/problems/today', () => {
    it('day=0 (오늘) — 200을 반환한다', async () => {
      // Given
      const problem = await seedProblemWithType({
        title: '오늘의 문제',
        level: 3,
      });
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      await seedTodayProblem(problem.uuid, today);

      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems/today')
        .query({ day: 0 })
        .expect(200);

      // Then
      expect(res.body.statusCode).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('day=-1 (어제) — 200을 반환한다', async () => {
      // Given
      const problem = await seedProblemWithType({
        title: '어제의 문제',
        level: 2,
      });
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(12, 0, 0, 0);
      await seedTodayProblem(problem.uuid, yesterday);

      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems/today')
        .query({ day: -1 })
        .expect(200);

      // Then
      expect(res.body.statusCode).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('day=-30 — 200을 반환한다', async () => {
      // Given
      const problem = await seedProblemWithType({
        title: '30일 전 문제',
        level: 4,
      });
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(12, 0, 0, 0);
      await seedTodayProblem(problem.uuid, thirtyDaysAgo);

      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems/today')
        .query({ day: -30 })
        .expect(200);

      // Then
      expect(res.body.statusCode).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('day=-31 — 400 "30일 전까지만 조회 가능합니다."', async () => {
      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems/today')
        .query({ day: -31 })
        .expect(400);

      // Then
      expect(res.body.statusCode).toBe(400);
      expect(res.body.errorMessage).toContain('30일 전까지만 조회 가능합니다.');
    });

    it('day=1 — 400 "과거 날짜만 조회 가능합니다."', async () => {
      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems/today')
        .query({ day: 1 })
        .expect(400);

      // Then
      expect(res.body.statusCode).toBe(400);
      expect(res.body.errorMessage).toContain('과거 날짜만 조회 가능합니다.');
    });

    it('day 미지정 — 200 (기본값 0)', async () => {
      // Given
      const problem = await seedProblemWithType({
        title: '기본 오늘의 문제',
        level: 1,
      });
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      await seedTodayProblem(problem.uuid, today);

      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems/today')
        .expect(200);

      // Then
      expect(res.body.statusCode).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('day=문자열 — 400 "날짜는 숫자만 입력할 수 있습니다."', async () => {
      // When
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems/today')
        .query({ day: 'abc' })
        .expect(400);

      // Then
      expect(res.body.statusCode).toBe(400);
      expect(res.body.errorMessage).toContain(
        '날짜는 숫자만 입력할 수 있습니다.',
      );
    });

    it('해당 날짜에 문제 없음 — 200과 빈 배열을 반환한다', async () => {
      // When — 시드 없이 조회
      const res = await request(app.getHttpServer())
        .get('/api/v2/problems/today')
        .query({ day: -5 })
        .expect(200);

      // Then
      expect(res.body.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('로그인/비로그인 state 매핑을 확인한다', async () => {
      // Given
      const user = await seedTestUser(prisma);
      const problem = await seedProblemWithType({
        title: '상태 확인 문제',
        level: 3,
      });
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      await seedTodayProblem(problem.uuid, today);
      await seedUserProblemState(user.uuid, problem.uuid, 'SOLVED');
      const accessToken = await getAccessToken(app, {
        sub: user.uuid,
        roles: [],
      });

      // When — 로그인 유저
      const loggedInRes = await request(app.getHttpServer())
        .get('/api/v2/problems/today')
        .query({ day: 0 })
        .set(createAuthHeaders(accessToken))
        .expect(200);

      // Then — 로그인 유저는 state가 SOLVED
      const loggedInProblem = loggedInRes.body.data.find(
        (p: { uuid: string }) => p.uuid === problem.uuid,
      );
      expect(loggedInProblem).toBeDefined();
      expect(loggedInProblem.state).toBe('SOLVED');

      // When — 비로그인 유저
      const guestRes = await request(app.getHttpServer())
        .get('/api/v2/problems/today')
        .query({ day: 0 })
        .expect(200);

      // Then — 비로그인 유저는 state가 NONE
      const guestProblem = guestRes.body.data.find(
        (p: { uuid: string }) => p.uuid === problem.uuid,
      );
      expect(guestProblem).toBeDefined();
      expect(guestProblem.state).toBe('NONE');
    });
  });

  // ─── GET /api/v2/problems/:problemUuid (상세) ────────────────

  describe('GET /api/v2/problems/:problemUuid', () => {
    it('존재하는 UUID — 200과 상세 정보를 반환한다', async () => {
      // Given
      const problem = await seedProblemWithType(
        { title: '상세 문제', level: 5 },
        ['수학', '구현'],
      );
      // inputOutput 시드
      await prisma.problemV2InputOutput.create({
        data: {
          order: 1,
          input: '1 2',
          output: '3',
          problemUuid: problem.uuid,
        },
      });

      // When
      const res = await request(app.getHttpServer())
        .get(`/api/v2/problems/${problem.uuid}`)
        .expect(200);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 200,
        errorCode: '0000',
        errorMessage: '',
      });
      expect(res.body.data).toMatchObject({
        uuid: problem.uuid,
        title: '상세 문제',
        level: 5,
      });
      expect(res.body.data.inputOutputList).toBeInstanceOf(Array);
      expect(res.body.data.inputOutputList.length).toBe(1);
      expect(res.body.data.typeList).toEqual(
        expect.arrayContaining(['수학', '구현']),
      );
      expect(res.body.data.subTaskList).toBeInstanceOf(Array);
    });

    it('존재하지 않는 UUID — 404 PROBLEM_NOT_FOUND', async () => {
      // Given
      const nonExistentUuid = '00000000-0000-0000-0000-000000000000';

      // When
      const res = await request(app.getHttpServer())
        .get(`/api/v2/problems/${nonExistentUuid}`)
        .expect(404);

      // Then
      expect(res.body).toMatchObject({
        statusCode: 404,
        errorCode: 'PROBLEM_NOT_FOUND',
      });
    });

    it('로그인 유저 — state가 매핑된다', async () => {
      // Given
      const user = await seedTestUser(prisma);
      const problem = await seedProblemWithType({
        title: '로그인 상세 문제',
        level: 3,
      });
      await seedUserProblemState(user.uuid, problem.uuid, 'FAILED');
      const accessToken = await getAccessToken(app, {
        sub: user.uuid,
        roles: [],
      });

      // When
      const res = await request(app.getHttpServer())
        .get(`/api/v2/problems/${problem.uuid}`)
        .set(createAuthHeaders(accessToken))
        .expect(200);

      // Then
      expect(res.body.data.state).toBe('FAILED');
    });

    it('비로그인 유저 — state=NONE', async () => {
      // Given
      const problem = await seedProblemWithType({
        title: '비로그인 상세 문제',
        level: 2,
      });

      // When
      const res = await request(app.getHttpServer())
        .get(`/api/v2/problems/${problem.uuid}`)
        .expect(200);

      // Then
      expect(res.body.data.state).toBe('NONE');
    });
  });
});
