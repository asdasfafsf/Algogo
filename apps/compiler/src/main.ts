import { NestFactory } from '@nestjs/core';
import { CompilerModule } from './compiler.module';

async function bootstrap() {
  const app = await NestFactory.create(CompilerModule);
  await app.listen(3000);
}
bootstrap();
