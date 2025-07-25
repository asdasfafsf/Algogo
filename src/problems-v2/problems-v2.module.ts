import { Module } from '@nestjs/common';
import { ProblemsV2Controller } from './problems-v2.controller';
import { ProblemsV2Service } from './problems-v2.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProblemsV2Repository } from './problems-v2.repository';
import { AuthGuardModule } from '../auth-guard/auth-guard.module';

@Module({
  controllers: [ProblemsV2Controller],
  providers: [ProblemsV2Service, ProblemsV2Repository],
  imports: [PrismaModule, AuthGuardModule],
})
export class ProblemsV2Module {}
