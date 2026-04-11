import { Module } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { ProblemsController } from './problems.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProblemsRepository } from './problems.repository';

@Module({
  controllers: [ProblemsController],
  providers: [ProblemsService, ProblemsRepository],
  imports: [PrismaModule],
})
export class ProblemsModule {}
