import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { CodeController } from './code.controller';
import { AuthModule } from '../auth/auth.module';
import { CodeRepository } from './code.repository';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  controllers: [CodeController],
  providers: [CodeService, CodeRepository],
  imports: [AuthModule, PrismaModule],
})
export class CodeModule {}
