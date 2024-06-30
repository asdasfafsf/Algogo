import { Module } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { ProblemsController } from './problems.controller';
import { CrawlerModule } from '../crawler/crawler.module';
import { ImageModule } from '../image/image.module';

@Module({
  controllers: [ProblemsController],
  providers: [ProblemsService],
  imports: [CrawlerModule, ImageModule],
})
export class ProblemsModule {}
