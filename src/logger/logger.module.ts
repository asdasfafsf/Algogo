import { Global, Module } from '@nestjs/common';
import { AppLogger } from './app-logger';
import { ConfigModule, ConfigType } from '@nestjs/config';
import * as winston from 'winston';
import LokiTransport from 'winston-loki';
import lokiConfig from '../config/lokiConfig';

@Global()
@Module({
  imports: [ConfigModule.forFeature(lokiConfig)],
  providers: [
    {
      provide: 'winston',
      inject: [lokiConfig.KEY],
      useFactory: (loki: ConfigType<typeof lokiConfig>) => {
        const transports: winston.transport[] = [
          new winston.transports.Console({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
        ];

        if (loki.enabled && loki.host) {
          transports.push(
            new LokiTransport({
              host: loki.host,
              basicAuth:
                loki.username && loki.password
                  ? `${loki.username}:${loki.password}`
                  : undefined,
              labels: { app: 'algogo' },
              batching: true,
              interval: 5,
              onConnectionError: (error: unknown) => {
                const message =
                  error instanceof Error ? error.message : String(error);
                process.stderr.write(`Loki connection error: ${message}\n`);
              },
            }),
          );
        }

        return winston.createLogger({ transports });
      },
    },
    AppLogger,
  ],
  exports: [AppLogger, 'winston'],
})
export class LoggerModule {}
