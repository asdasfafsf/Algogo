import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validationSchema';
import { CrawlerModule } from './crawler/crawler.module';
import crawlerConfig from './config/crawlerConfig';
import { ProblemsModule } from './problems/problems.module';
import { S3Module } from './s3/s3.module';
import { ImageModule } from './image/image.module';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';

import s3Config from './config/s3Config';

import { PrismaModule } from './prisma/prisma.module';
import * as winston from 'winston';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from '@libs/filter/src';
import { ResponseInterceptor } from '@libs/interceptor/src';
import { UsersModule } from './users/users.module';
import { AuthController } from './auth/auth.controller';
import { OauthModule } from './oauth/oauth.module';
import googleOAuthConfig from './config/googleOAuthConfig';
import kakaoOAuthConfig from './config/kakaoOAuthConfig';
import githubOAuthConfig from './config/githubOAuthConfig';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike('MyApp', {
              prettyPrint: true,
            }),
          ),
        }),
      ],
    }),
    ConfigModule.forRoot({
      envFilePath: [`${__dirname}/config/env/.${process.env.NODE_ENV}.env`],
      load: [
        crawlerConfig,
        s3Config,
        googleOAuthConfig,
        kakaoOAuthConfig,
        githubOAuthConfig,
      ],
      isGlobal: true,
      validationSchema,
    }),
    CrawlerModule,
    ProblemsModule,
    S3Module,
    ImageModule,
    PrismaModule,
    UsersModule,
    OauthModule,
  ],

  controllers: [AppController, AuthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    AppService,
  ],
})
export class AppModule {}
