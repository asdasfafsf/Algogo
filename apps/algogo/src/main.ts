import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as requestIp from 'request-ip';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { RedisIoAdapter } from './redis/redis.io.adapter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV === 'development') {
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

    app.enableCors({
      origin:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:5173'
          : undefined,
      credentials: process.env.NODE_ENV === 'development',
    });
  }

  app.use(helmet());

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
  await app.listen(Number(process.env.SERVER_PORT));
}
bootstrap();
