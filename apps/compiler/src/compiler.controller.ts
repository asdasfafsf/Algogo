import { Controller, Get } from '@nestjs/common';
import { CompilerService } from './compiler.service';

@Controller()
export class CompilerController {
  constructor(private readonly compilerService: CompilerService) {}

  @Get()
  getHello(): string {
    return this.compilerService.getHello();
  }
}
