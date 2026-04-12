import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, closeTestApp } from './helpers/setup';
import { getAccessToken, createAuthHeaders } from './helpers/auth';
import { seedTestUser, seedTestProblem, cleanDatabase } from './helpers/seed';
import { PrismaService } from '../src/prisma/prisma.service';
import { MAX_CODE_TEMPLATE_COUNT } from '../src/code/constants';

describe('Code E2E', () => {
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

  async function createUserAndToken(overrides?: { uuid?: string }) {
    const user = await seedTestUser(prisma, overrides);
    const token = await getAccessToken(app, {
      sub: user.uuid,
      roles: [],
    });
    return { user, token, headers: createAuthHeaders(token) };
  }

  // ─── 코드 설정 (Setting) ────────────────────────────────────

  describe('코드 설정 (Setting)', () => {
    describe('GET /api/v1/code/setting', () => {
      it('설정이 있는 유저 -- 200과 설정을 반환한다', async () => {
        // Given
        const { user, headers } = await createUserAndToken();
        await prisma.codeSetting.create({
          data: {
            userUuid: user.uuid,
            fontSize: 16,
            problemContentRate: 150,
            theme: 'vs-dark',
            tabSize: 4,
            lineNumber: 'on',
            defaultLanguage: 'Python',
          },
        });

        // When
        const res = await request(app.getHttpServer())
          .get('/api/v1/code/setting')
          .set(headers)
          .expect(200);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 200,
          errorCode: '0000',
          errorMessage: '',
        });
        expect(res.body.data).toMatchObject({
          fontSize: 16,
          problemContentRate: 150,
          theme: 'vs-dark',
          tabSize: 4,
          lineNumber: 'on',
          defaultLanguage: 'Python',
        });
      });

      it('설정이 없는 유저 -- 404 CODE_SETTING_NOT_FOUND', async () => {
        // Given
        const { headers } = await createUserAndToken();

        // When
        const res = await request(app.getHttpServer())
          .get('/api/v1/code/setting')
          .set(headers)
          .expect(404);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 404,
          errorCode: 'CODE_SETTING_NOT_FOUND',
        });
      });
    });

    describe('PUT /api/v1/code/setting', () => {
      it('최초 생성 -- 200', async () => {
        // Given
        const { headers } = await createUserAndToken();

        // When
        const res = await request(app.getHttpServer())
          .put('/api/v1/code/setting')
          .set(headers)
          .send({
            fontSize: 18,
            problemContentRate: 120,
            theme: 'light',
            tabSize: 2,
            lineNumber: 'relative',
            defaultLanguage: 'Java',
          })
          .expect(200);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 200,
          errorCode: '0000',
          errorMessage: '',
        });
      });

      it('기존 설정 업데이트 -- 200', async () => {
        // Given
        const { user, headers } = await createUserAndToken();
        await prisma.codeSetting.create({
          data: {
            userUuid: user.uuid,
            fontSize: 14,
            problemContentRate: 100,
            theme: 'vs-dark',
            tabSize: 4,
            lineNumber: 'on',
            defaultLanguage: 'Python',
          },
        });

        // When
        const res = await request(app.getHttpServer())
          .put('/api/v1/code/setting')
          .set(headers)
          .send({
            fontSize: 20,
            theme: 'light',
          })
          .expect(200);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 200,
          errorCode: '0000',
        });
      });
    });

    it('토큰 없이 요청 -- 401', async () => {
      // When
      const res = await request(app.getHttpServer())
        .get('/api/v1/code/setting')
        .expect(401);

      // Then
      expect(res.body.statusCode).toBe(401);
    });
  });

  // ─── 코드 템플릿 (Template CRUD) ─────────────────────────────

  describe('코드 템플릿 (Template CRUD)', () => {
    describe('GET /api/v1/code/template', () => {
      it('템플릿이 있는 유저 -- 200과 목록을 반환한다', async () => {
        // Given
        const { user, headers } = await createUserAndToken();
        await prisma.codeTemplate.create({
          data: {
            userUuid: user.uuid,
            name: '템플릿 1',
            language: 'Python',
            content: 'print("hello")',
            description: '테스트 템플릿',
          },
        });

        // When
        const res = await request(app.getHttpServer())
          .get('/api/v1/code/template')
          .set(headers)
          .expect(200);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 200,
          errorCode: '0000',
          errorMessage: '',
        });
        expect(res.body.data.summaryList).toBeInstanceOf(Array);
        expect(res.body.data.summaryList.length).toBe(1);
        expect(res.body.data.defaultList).toBeInstanceOf(Array);
      });

      it('템플릿이 없는 유저 -- 200과 빈 목록을 반환한다', async () => {
        // Given
        const { headers } = await createUserAndToken();

        // When
        const res = await request(app.getHttpServer())
          .get('/api/v1/code/template')
          .set(headers)
          .expect(200);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 200,
          errorCode: '0000',
        });
        expect(res.body.data.summaryList).toEqual([]);
        expect(res.body.data.defaultList).toEqual([]);
      });
    });

    describe('GET /api/v1/code/template/:uuid', () => {
      it('내 템플릿 -- 200과 템플릿 상세를 반환한다', async () => {
        // Given
        const { user, headers } = await createUserAndToken();
        const template = await prisma.codeTemplate.create({
          data: {
            userUuid: user.uuid,
            name: '상세 조회 템플릿',
            language: 'Java',
            content: 'public class Main {}',
            description: '자바 템플릿',
          },
        });

        // When
        const res = await request(app.getHttpServer())
          .get(`/api/v1/code/template/${template.uuid}`)
          .set(headers)
          .expect(200);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 200,
          errorCode: '0000',
        });
        expect(res.body.data).toMatchObject({
          uuid: template.uuid,
          name: '상세 조회 템플릿',
          language: 'Java',
          content: 'public class Main {}',
          description: '자바 템플릿',
        });
      });

      it('존재하지 않는 UUID -- 404 CODE_TEMPLATE_NOT_FOUND', async () => {
        // Given
        const { headers } = await createUserAndToken();
        const nonExistentUuid = '00000000-0000-0000-0000-000000000000';

        // When
        const res = await request(app.getHttpServer())
          .get(`/api/v1/code/template/${nonExistentUuid}`)
          .set(headers)
          .expect(404);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 404,
          errorCode: 'CODE_TEMPLATE_NOT_FOUND',
        });
      });

      it('다른 유저의 템플릿 -- 404 CODE_TEMPLATE_NOT_FOUND', async () => {
        // Given
        const { headers } = await createUserAndToken();
        const otherUser = await seedTestUser(prisma);
        const otherTemplate = await prisma.codeTemplate.create({
          data: {
            userUuid: otherUser.uuid,
            name: '다른 유저 템플릿',
            language: 'Python',
            content: 'print("other")',
            description: '',
          },
        });

        // When
        const res = await request(app.getHttpServer())
          .get(`/api/v1/code/template/${otherTemplate.uuid}`)
          .set(headers)
          .expect(404);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 404,
          errorCode: 'CODE_TEMPLATE_NOT_FOUND',
        });
      });
    });

    describe('POST /api/v1/code/template', () => {
      it('isDefault=false -- 200과 생성된 템플릿을 반환한다', async () => {
        // Given
        const { headers } = await createUserAndToken();

        // When
        const res = await request(app.getHttpServer())
          .post('/api/v1/code/template')
          .set(headers)
          .send({
            name: '새 템플릿',
            content: 'console.log("hello")',
            description: '노드 템플릿',
            language: 'Node.js',
            isDefault: false,
          })
          .expect(200);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 200,
          errorCode: '0000',
        });
        expect(res.body.data).toMatchObject({
          name: '새 템플릿',
          content: 'console.log("hello")',
          language: 'Node.js',
        });
        expect(res.body.data.uuid).toBeDefined();
      });

      it('isDefault=true -- 200과 기본 템플릿 설정', async () => {
        // Given
        const { user, headers } = await createUserAndToken();

        // When
        const res = await request(app.getHttpServer())
          .post('/api/v1/code/template')
          .set(headers)
          .send({
            name: '기본 템플릿',
            content: 'print("default")',
            description: '기본 파이썬 템플릿',
            language: 'Python',
            isDefault: true,
          })
          .expect(200);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 200,
          errorCode: '0000',
        });

        // 기본 템플릿이 설정되었는지 확인
        const defaultTemplate = await prisma.codeDefaultTemplate.findUnique({
          where: {
            userUuid_language: {
              userUuid: user.uuid,
              language: 'Python',
            },
          },
        });
        expect(defaultTemplate).not.toBeNull();
      });

      it('10개 보유 시 -- 409 CODE_TEMPLATE_LIMIT_EXCEEDED', async () => {
        // Given
        const { user, headers } = await createUserAndToken();
        for (let i = 0; i < MAX_CODE_TEMPLATE_COUNT; i++) {
          await prisma.codeTemplate.create({
            data: {
              userUuid: user.uuid,
              name: `템플릿 ${i}`,
              language: 'Python',
              content: `print(${i})`,
              description: '',
            },
          });
        }

        // When
        const res = await request(app.getHttpServer())
          .post('/api/v1/code/template')
          .set(headers)
          .send({
            name: '11번째 템플릿',
            content: 'print("over limit")',
            language: 'Python',
            isDefault: false,
          })
          .expect(409);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 409,
          errorCode: 'CODE_TEMPLATE_LIMIT_EXCEEDED',
        });
      });
    });

    describe('PATCH /api/v1/code/template', () => {
      it('존재하는 템플릿 수정 -- 200', async () => {
        // Given
        const { user, headers } = await createUserAndToken();
        const template = await prisma.codeTemplate.create({
          data: {
            userUuid: user.uuid,
            name: '수정 전 이름',
            language: 'Python',
            content: 'print("before")',
            description: '수정 전',
          },
        });

        // When
        const res = await request(app.getHttpServer())
          .patch('/api/v1/code/template')
          .set(headers)
          .send({
            uuid: template.uuid,
            name: '수정 후 이름',
            content: 'print("after")',
            description: '수정 후',
            language: 'Python',
            isDefault: false,
          })
          .expect(200);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 200,
          errorCode: '0000',
        });
        expect(res.body.data).toMatchObject({
          name: '수정 후 이름',
          content: 'print("after")',
        });
      });

      it('없는 UUID -- 404 CODE_TEMPLATE_NOT_FOUND', async () => {
        // Given
        const { headers } = await createUserAndToken();

        // When
        const res = await request(app.getHttpServer())
          .patch('/api/v1/code/template')
          .set(headers)
          .send({
            uuid: '00000000-0000-0000-0000-000000000000',
            language: 'Python',
            isDefault: false,
          })
          .expect(404);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 404,
          errorCode: 'CODE_TEMPLATE_NOT_FOUND',
        });
      });
    });

    describe('DELETE /api/v1/code/template/:uuid', () => {
      it('내 템플릿 삭제 -- 200', async () => {
        // Given
        const { user, headers } = await createUserAndToken();
        const template = await prisma.codeTemplate.create({
          data: {
            userUuid: user.uuid,
            name: '삭제할 템플릿',
            language: 'C++',
            content: '#include <iostream>',
            description: '',
          },
        });

        // When
        const res = await request(app.getHttpServer())
          .delete(`/api/v1/code/template/${template.uuid}`)
          .set(headers)
          .expect(200);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 200,
          errorCode: '0000',
        });
      });

      it('없는 UUID -- 404 CODE_TEMPLATE_NOT_FOUND', async () => {
        // Given
        const { headers } = await createUserAndToken();

        // When
        const res = await request(app.getHttpServer())
          .delete('/api/v1/code/template/00000000-0000-0000-0000-000000000000')
          .set(headers)
          .expect(404);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 404,
          errorCode: 'CODE_TEMPLATE_NOT_FOUND',
        });
      });

      it('삭제 후 GET 조회 -- 404', async () => {
        // Given
        const { user, headers } = await createUserAndToken();
        const template = await prisma.codeTemplate.create({
          data: {
            userUuid: user.uuid,
            name: '삭제 후 조회 템플릿',
            language: 'Java',
            content: 'class Main {}',
            description: '',
          },
        });

        // 삭제
        await request(app.getHttpServer())
          .delete(`/api/v1/code/template/${template.uuid}`)
          .set(headers)
          .expect(200);

        // When
        const res = await request(app.getHttpServer())
          .get(`/api/v1/code/template/${template.uuid}`)
          .set(headers)
          .expect(404);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 404,
          errorCode: 'CODE_TEMPLATE_NOT_FOUND',
        });
      });
    });
  });

  // ─── 문제 코드 (Problem Code) ─────────────────────────────────

  describe('문제 코드 (Problem Code)', () => {
    describe('GET /api/v1/code/problem/:problemUuid', () => {
      it('저장된 코드가 있음 -- 200과 코드 목록을 반환한다', async () => {
        // Given
        const { user, headers } = await createUserAndToken();
        const problem = await seedTestProblem(prisma);
        await prisma.problemCode.create({
          data: {
            userUuid: user.uuid,
            problemUuid: problem.uuid,
            language: 'Python',
            content: 'print("solution")',
          },
        });

        // When
        const res = await request(app.getHttpServer())
          .get(`/api/v1/code/problem/${problem.uuid}`)
          .set(headers)
          .expect(200);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 200,
          errorCode: '0000',
          errorMessage: '',
        });
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0]).toMatchObject({
          language: 'Python',
          content: 'print("solution")',
        });
      });

      it('저장된 코드가 없음 -- 200과 빈 배열을 반환한다', async () => {
        // Given
        const { headers } = await createUserAndToken();
        const problem = await seedTestProblem(prisma);

        // When
        const res = await request(app.getHttpServer())
          .get(`/api/v1/code/problem/${problem.uuid}`)
          .set(headers)
          .expect(200);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 200,
          errorCode: '0000',
        });
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(0);
      });
    });

    describe('PUT /api/v1/code/problem', () => {
      it('새 코드 저장 -- 200', async () => {
        // Given
        const { headers } = await createUserAndToken();
        const problem = await seedTestProblem(prisma);

        // When
        const res = await request(app.getHttpServer())
          .put('/api/v1/code/problem')
          .set(headers)
          .send({
            problemUuid: problem.uuid,
            language: 'Python',
            content: 'print("new code")',
          })
          .expect(200);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 200,
          errorCode: '0000',
        });
      });

      it('같은 문제+언어 업데이트 -- 200', async () => {
        // Given
        const { user, headers } = await createUserAndToken();
        const problem = await seedTestProblem(prisma);
        await prisma.problemCode.create({
          data: {
            userUuid: user.uuid,
            problemUuid: problem.uuid,
            language: 'Java',
            content: 'class Main {}',
          },
        });

        // When
        const res = await request(app.getHttpServer())
          .put('/api/v1/code/problem')
          .set(headers)
          .send({
            problemUuid: problem.uuid,
            language: 'Java',
            content: 'class Main { public static void main(String[] args) {} }',
          })
          .expect(200);

        // Then
        expect(res.body).toMatchObject({
          statusCode: 200,
          errorCode: '0000',
        });
      });
    });
  });
});
