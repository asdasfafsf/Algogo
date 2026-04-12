import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate, INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';

export async function createTestApp(options?: {
  overrideGuards?: Array<{
    guard: new (...args: never[]) => CanActivate;
    mockValue: CanActivate;
  }>;
}): Promise<{
  app: INestApplication;
  module: TestingModule;
}> {
  let builder = Test.createTestingModule({
    imports: [AppModule],
  });

  if (options?.overrideGuards) {
    for (const { guard, mockValue } of options.overrideGuards) {
      builder = builder.overrideGuard(guard).useValue(mockValue);
    }
  }

  const module = await builder.compile();

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
