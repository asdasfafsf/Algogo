import { Module } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { ProblemsController } from './problems.controller';
import { CrawlerModule } from '../crawler/crawler.module';

@Module({
  controllers: [ProblemsController],
  providers: [ProblemsService],
  imports: [CrawlerModule],
})
export class ProblemsModule {}
