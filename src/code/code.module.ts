import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { CodeController } from './code.controller';
import { CodeRepository } from './code.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { AuthGuardModule } from '../auth-guard/auth-guard.module';
@Module({
  controllers: [CodeController],
  providers: [CodeService, CodeRepository],
  imports: [AuthGuardModule, PrismaModule, RedisModule],
})
export class CodeModule {}
