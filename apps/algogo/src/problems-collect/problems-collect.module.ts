import { Module } from '@nestjs/common';
import { ProblemsCollectService } from './problems-collect.service';
import { ProblemsCollectController } from './problems-collect.controller';
import { CrawlerModule } from '../crawler/crawler.module';
import { ProblemsCollectRepository } from './problems-collect.repository';
import { RedisModule } from '../redis/redis.module';
import { ImageModule } from '../image/image.module';
import { S3Module } from '../s3/s3.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthV2Module } from '../auth-v2/auth-v2.module';
@Module({
  controllers: [ProblemsCollectController],
  providers: [ProblemsCollectService, ProblemsCollectRepository],
  imports: [
    AuthV2Module,
    CrawlerModule,
    RedisModule,
    ImageModule,
    S3Module,
    PrismaModule,
  ],
})
export class ProblemsCollectModule {}
