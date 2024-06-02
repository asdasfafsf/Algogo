import { Module } from '@nestjs/common';
import { CompilerController } from './compiler.controller';
import { CompilerService } from './compiler.service';

@Module({
  imports: [],
  controllers: [CompilerController],
  providers: [CompilerService],
})
export class CompilerModule {}
