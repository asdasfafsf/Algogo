import { Injectable } from '@nestjs/common';
import { ProblemSiteRepository } from './problem-site.repository';
import { ProblemSiteProvider } from 'src/common/types/problem-site.type';

@Injectable()
export class ProblemSiteService {
  constructor(private readonly problemSiteRepository: ProblemSiteRepository) {}

  async createProblemSite({
    userUuid,
    provider,
    handle,
  }: {
    userUuid: string;
    provider: ProblemSiteProvider;
    handle: string;
  }) {
    return this.problemSiteRepository.createProblemSite({
      userUuid,
      provider,
      handle,
    });
  }
  async deleteProblemSite({
    userUuid,
    provider,
  }: {
    userUuid: string;
    provider: ProblemSiteProvider;
  }) {
    return this.problemSiteRepository.deleteProblemSite({
      userUuid,
      provider,
    });
  }
}
