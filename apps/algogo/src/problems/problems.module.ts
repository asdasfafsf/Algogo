import { Module } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { ProblemsController } from './problems.controller';
import { CrawlerModule } from '../crawler/crawler.module';
import { ImageModule } from '../image/image.module';
import { S3Module } from '../s3/s3.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProblemsRepository } from './problems.repository';

@Module({
  controllers: [ProblemsController],
  providers: [ProblemsService, ProblemsRepository],
  imports: [CrawlerModule, ImageModule, S3Module, PrismaModule],
})
export class ProblemsModule {}
