import { Module } from '@nestjs/common';
import { ProblemsCollectService } from './problems-collect.service';
import { ProblemsCollectController } from './problems-collect.controller';
import { AuthModule } from '../auth/auth.module';
@Module({
  controllers: [ProblemsCollectController],
  providers: [ProblemsCollectService],
  imports: [AuthModule]
})
export class ProblemsCollectModule {}
