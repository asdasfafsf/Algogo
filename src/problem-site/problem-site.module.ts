import { Module } from '@nestjs/common';
import { ProblemSiteController } from './problem-site.controller';
import { ProblemSiteService } from './problem-site.service';

@Module({
  controllers: [ProblemSiteController],
  providers: [ProblemSiteService],
})
export class ProblemSiteModule {}
