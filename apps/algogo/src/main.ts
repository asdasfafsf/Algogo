import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as requestIp from 'request-ip';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:5173'
        : undefined,
    credentials: process.env.NODE_ENV === 'development',
  });

  app.use(requestIp.mw());
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
