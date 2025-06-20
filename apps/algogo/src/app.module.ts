import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigType } from '@nestjs/config';
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
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ResponseInterceptor } from './interceptors/response-interceptor';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';
import { JwtModule } from './jwt/jwt.module';
import { CryptoModule } from './crypto/crypto.module';
import { ExecuteModule } from './execute/execute.module';
import { MeModule } from './me/me.module';
import { LoggerModule } from './logger/logger.module';
import { ProblemsReportModule } from './problems-report/problems-report.module';
import { ProblemsCollectModule } from './problems-collect/problems-collect.module';
import { CodeModule } from './code/code.module';
import { ProblemsV2Module } from './problems-v2/problems-v2.module';
import { AuthV2Module } from './auth-v2/auth-v2.module';
import { OauthV2Module } from './oauth-v2/oauth-v2.module';
import googleOAuthConfig from './config/googleOAuthConfig';
import kakaoOAuthConfig from './config/kakaoOAuthConfig';
import githubOAuthConfig from './config/githubOAuthConfig';
import redisConfig from './config/redisConfig';
import jwtConfig from './config/jwtConfig';
import encryptConfig from './config/encryptConfig';
import bullmqConfig from './config/bullmqConfig';
import wsConfig from './config/wsConfig';
import LoggerConfig from './config/LoggerConfig';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';
import { RequestMetadataMiddleware } from './middlewares/RequestMetadataMiddleware';
import { AuthGuardModule } from './auth-guard/auth-guard.module';

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
      envFilePath: [
        `${__dirname}/config/env/.${process.env.NODE_ENV ?? 'production'}.env`,
      ],
      load: [
        crawlerConfig,
        s3Config,
        googleOAuthConfig,
        kakaoOAuthConfig,
        githubOAuthConfig,
        redisConfig,
        jwtConfig,
        encryptConfig,
        bullmqConfig,
        wsConfig,
        LoggerConfig,
      ],
      isGlobal: true,
      validationSchema,
    }),
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      useFactory: async (config: ConfigType<typeof redisConfig>) => ({
        store: redisStore,
        host: config.host,
        port: config.port,
        password: config.password,
      }),
      inject: [redisConfig.KEY],
      isGlobal: true,
    }),

    CrawlerModule,
    ProblemsModule,
    S3Module,
    ImageModule,
    PrismaModule,
    UsersModule,
    RedisModule.forRootAsync({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    }),
    JwtModule,
    CryptoModule,
    ExecuteModule,
    MeModule,
    LoggerModule,
    ProblemsReportModule,
    ProblemsCollectModule,
    CodeModule,
    ProblemsV2Module,
    AuthV2Module,
    OauthV2Module,
    AuthGuardModule,
  ],

  controllers: [AppController],
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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestMetadataMiddleware).forRoutes('*');
  }
}
