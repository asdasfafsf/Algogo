import { initTracing } from './tracing';
initTracing();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as requestIp from 'request-ip';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as compression from 'compression';
import { RedisIoAdapter } from './redis/redis.io.adapter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    const config = new DocumentBuilder()
      .setTitle('Algogo API')
      .setDescription('Algogo API')
      .setVersion('1.0')
      .addTag('algogo')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'Authorization',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  app.enableCors({
    origin: isDevelopment
      ? process.env.FRONTEND_URL || 'http://localhost:5173'
      : process.env.FRONTEND_URL || false,
    credentials: true,
  });

  app.use(helmet());
  app.use(compression());

  app.use(requestIp.mw());
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  app.enableShutdownHooks();

  await app.listen(Number(process.env.SERVER_PORT));
}
bootstrap();
