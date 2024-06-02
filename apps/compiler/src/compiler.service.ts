import { Injectable } from '@nestjs/common';

@Injectable()
export class CompilerService {
  getHello(): string {
    return 'Hello World!';
  }
}
