import { PrismaService } from '../../prisma/prisma.service';

export function Transaction() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const prisma = this.prisma as PrismaService;

      return await prisma.$transaction(async (tx) => {
        // repository들의 prisma 클라이언트를 트랜잭션 클라이언트로 교체
        const repositories = Object.entries(this).filter(([, value]) =>
          value?.constructor?.name?.toLowerCase().includes('repository'),
        );

        const originalRepositories = new Map(repositories);

        // 각 repository의 prisma 클라이언트를 트랜잭션 클라이언트로 교체
        repositories.forEach(([key, repo]) => {
          this[key] = Object.create(repo as object);
          this[key].prisma = tx;
        });

        try {
          const result = await originalMethod.apply(this, args);
          return result;
        } finally {
          // 원래의 repository 인스턴스로 복구
          originalRepositories.forEach((repo, key) => {
            this[key] = repo;
          });
        }
      });
    };

    return descriptor;
  };
}
