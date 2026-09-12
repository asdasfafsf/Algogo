import {
  Global,
  Inject,
  Injectable,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import pino, { Logger } from 'pino';
import type { LokiOptions } from 'pino-loki';
import lokiConfig from '../config/lokiConfig';
import { AppLogger } from './app-logger';
import { PINO_LOGGER } from './logger.constants';

const PINO_RESOURCES = Symbol('PINO_RESOURCES');

export type PinoResources = {
  logger: Logger;
  transport: ReturnType<typeof pino.transport>;
};

export function createPinoResources(
  loki: ConfigType<typeof lokiConfig>,
): PinoResources {
  const targets: pino.TransportTargetOptions[] = [
    { target: 'pino/file', level: 'trace', options: { destination: 1 } },
  ];

  if (loki.enabled && loki.host) {
    const options: LokiOptions = {
      host: loki.host,
      labels: { app: 'algogo' },
      batching: false,
      silenceErrors: false,
    };
    if (loki.username && loki.password) {
      options.basicAuth = {
        username: loki.username,
        password: loki.password,
      };
    }
    targets.push({ target: 'pino-loki', level: 'trace', options });
  }

  const transport = pino.transport({ targets });
  transport.on('error', (error: Error) => {
    process.stderr.write(`Pino transport error: ${error.message}\n`);
  });
  const logger = pino(
    {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'trace',
      timestamp: pino.stdTimeFunctions.isoTime,
      redact: {
        paths: [
          'authorization',
          'cookie',
          'password',
          'token',
          'accessToken',
          'refreshToken',
          'headers.authorization',
          'headers.cookie',
        ],
        censor: '[REDACTED]',
      },
    },
    transport,
  );

  return { logger, transport };
}

@Injectable()
export class PinoLifecycle implements OnApplicationShutdown {
  private closed = false;

  constructor(
    @Inject(PINO_RESOURCES)
    private readonly resources: PinoResources,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.closed) return;
    this.closed = true;

    await new Promise<void>((resolve, reject) => {
      this.resources.logger.flush((error) =>
        error ? reject(error) : resolve(),
      );
    });
    await new Promise<void>((resolve, reject) => {
      this.resources.transport.once('close', resolve);
      this.resources.transport.once('error', reject);
      this.resources.transport.end();
    });
  }
}

@Global()
@Module({
  imports: [ConfigModule.forFeature(lokiConfig)],
  providers: [
    {
      provide: PINO_RESOURCES,
      inject: [lokiConfig.KEY],
      useFactory: createPinoResources,
    },
    {
      provide: PINO_LOGGER,
      inject: [PINO_RESOURCES],
      useFactory: (resources: PinoResources) => resources.logger,
    },
    PinoLifecycle,
    AppLogger,
  ],
  exports: [AppLogger, PINO_LOGGER],
})
export class LoggerModule {}
