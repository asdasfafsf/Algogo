import { NestFactory } from '@nestjs/core';
import { CompilerModule } from './compiler.module';

async function bootstrap() {
  const app = await NestFactory.create(CompilerModule);
  import { AllExceptionsFilter } from '@libs/filter/src/index';
  import { ResponseInterceptor } from '@libs/interceptor/src/index';

  await app.listen(3000);
}
bootstrap();
