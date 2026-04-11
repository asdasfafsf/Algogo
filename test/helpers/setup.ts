import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';

export async function createTestApp(): Promise<{
  app: INestApplication;
  module: TestingModule;
}> {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = module.createNestApplication();

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.init();

  return { app, module };
}

export async function closeTestApp(app: INestApplication): Promise<void> {
  await app.close();
}
