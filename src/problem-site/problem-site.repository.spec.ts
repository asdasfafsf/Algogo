import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ProblemSiteRepository } from './problem-site.repository';

describe('ProblemSiteRepository', () => {
  let repository: ProblemSiteRepository;
  const deleteProblemSiteAccount = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemSiteRepository,
        {
          provide: PrismaService,
          useValue: {
            problemSiteAccount: { delete: deleteProblemSiteAccount },
          },
        },
      ],
    }).compile();

    repository = module.get(ProblemSiteRepository);
    deleteProblemSiteAccount.mockReset();
  });

  it('사용자와 provider 복합 키로 계정을 삭제한다', async () => {
    deleteProblemSiteAccount.mockResolvedValue({ no: 1 });

    await repository.deleteProblemSite({
      userUuid: 'user-1',
      provider: 'BOJ',
    });

    expect(deleteProblemSiteAccount).toHaveBeenCalledWith({
      where: {
        userUuid_provider: {
          userUuid: 'user-1',
          provider: 'BOJ',
        },
      },
    });
  });
});
