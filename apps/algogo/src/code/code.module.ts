import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { CodeController } from './code.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [CodeController],
  providers: [CodeService],
  imports: [AuthModule],
})
export class CodeModule {}
