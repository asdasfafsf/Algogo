import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProblemSiteProvider } from '../common/types/problem-site.type';

@Injectable()
export class ProblemSiteRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 문제 사이트 계정 생성
   * @param userUuid 사용자 UUID
   * @param provider 문제 사이트 제공자
   * @param handle 문제 사이트 계정 핸들
   * @returns 생성된 문제 사이트 계정
   */
  async createProblemSite({
    userUuid,
    provider,
    handle,
  }: {
    userUuid: string;
    provider: ProblemSiteProvider;
    handle: string;
  }) {
    return this.prisma.problemSiteAccount.create({
      data: {
        userUuid,
        provider,
        handle,
      },
    });
  }

  /**
   * 문제 사이트 계정 삭제
   * @param userUuid 사용자 UUID
   * @param provider 문제 사이트 제공자
   * @returns 삭제된 문제 사이트 계정
   */
  async deleteProblemSite({
    userUuid,
    provider,
  }: {
    userUuid: string;
    provider: ProblemSiteProvider;
  }) {
    return this.prisma.problemSiteAccount.delete({
      select: {},
      where: {
        userUuid_provider: {
          userUuid,
          provider,
        },
      },
    });
  }
}
