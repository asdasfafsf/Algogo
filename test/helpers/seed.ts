import { PrismaService } from '../../src/prisma/prisma.service';
import { uuidv7 } from 'uuidv7';

export async function seedTestUser(
  prisma: PrismaService,
  overrides?: Partial<{
    uuid: string;
    email: string;
    name: string;
    state: string;
  }>,
) {
  const uuid = overrides?.uuid ?? uuidv7();
  return prisma.user.create({
    data: {
      uuid,
      email: overrides?.email ?? `test-${uuid}@test.com`,
      name: overrides?.name ?? 'test-user',
      profilePhoto: '',
      emailVerified: false,
      state: overrides?.state ?? 'ACTIVE',
      lastLoginDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function seedTestUserWithRoles(
  prisma: PrismaService,
  roles: string[],
) {
  const user = await seedTestUser(prisma);
  for (const role of roles) {
    await prisma.userRole.create({
      data: {
        userUuid: user.uuid,
        role,
      },
    });
  }
  return user;
}

export async function seedTestProblem(
  prisma: PrismaService,
  overrides?: Partial<{
    uuid: string;
    title: string;
    source: string;
    sourceId: string;
  }>,
) {
  const uuid = overrides?.uuid ?? uuidv7();
  return prisma.problemV2.create({
    data: {
      uuid,
      title: overrides?.title ?? 'test-problem',
      level: 1,
      levelText: 'Bronze V',
      answerRate: 50.0,
      submitCount: 100,
      timeout: 1000,
      memoryLimit: 256,
      answerCount: 50,
      answerPeopleCount: 50,
      source: overrides?.source ?? 'baekjoon',
      sourceUrl: 'https://www.acmicpc.net/problem/1000',
      sourceId: overrides?.sourceId ?? `test-${uuid}`,
      content: '<p>test problem content</p>',
    },
  });
}

const TABLE_NAMES = [
  'USER_LOGIN_HISTORY',
  'USER_SESSION',
  'USER_ROLE',
  'USER_OAUTH',
  'USER_SOCIAL',
  'PROBLEM_CODE',
  'USER_PROBLEM_STATE',
  'TODAY_PROBLEM',
  'PROBLEM_V2_INPUT_OUTPUT',
  'PROBLEM_V2_TYPE',
  'PROBLEM_V2_SUB_TASK',
  'PROBLEM_V2_LANGUAGE_LIMIT',
  'PROBLEM_V2',
  'CODE_DEFAULT_TEMPLATE',
  'CODE_TEMPLATE',
  'CODE_SETTING',
  'PROBLEM_SITE_ACCOUNT',
  'USER',
] as const;

export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  for (const table of TABLE_NAMES) {
    await prisma.$executeRawUnsafe(`DELETE FROM \`${table}\``);
  }
}
