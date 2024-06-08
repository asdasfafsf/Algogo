import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { CrawlerModule } from './crawler.module';
import { AllExceptionsFilter } from '@libs/common/filter/exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(CrawlerModule);
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  await app.listen(3000);
  //d
}
bootstrap();
