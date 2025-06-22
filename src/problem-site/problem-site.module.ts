import { Module } from '@nestjs/common';
import { ProblemSiteController } from './problem-site.controller';
import { ProblemSiteService } from './problem-site.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthGuardModule } from '../auth-guard/auth-guard.module';
import { ProblemSiteRepository } from './problem-site.repository';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  controllers: [ProblemSiteController],
  providers: [ProblemSiteService, ProblemSiteRepository],
  imports: [PrismaModule, AuthGuardModule, AuthorizationModule],
})
export class ProblemSiteModule {}
