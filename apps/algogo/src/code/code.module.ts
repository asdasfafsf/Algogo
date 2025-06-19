import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { CodeController } from './code.controller';
import { CodeRepository } from './code.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { AuthV2Module } from '../auth-v2/auth-v2.module';
@Module({
  controllers: [CodeController],
  providers: [CodeService, CodeRepository],
  imports: [AuthV2Module, PrismaModule, RedisModule],
})
export class CodeModule {}
