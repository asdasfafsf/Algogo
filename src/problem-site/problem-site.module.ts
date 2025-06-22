import { Module } from '@nestjs/common';
import { ProblemSiteController } from './problem-site.controller';
import { ProblemSiteService } from './problem-site.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthGuardModule } from '../auth-guard/auth-guard.module';

@Module({
  controllers: [ProblemSiteController],
  providers: [ProblemSiteService],
  imports: [PrismaModule, AuthGuardModule],
})
export class ProblemSiteModule {}
