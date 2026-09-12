import { Inject, Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import type { Logger } from 'pino';
import { PINO_LOGGER } from './logger.constants';

@Injectable()
export class AppLogger {
  private context = '';

  constructor(
    @Inject(PINO_LOGGER)
    private readonly pino: Logger,
    private readonly cls: ClsService,
  ) {}

  setContext(context: string) {
    this.context = context;
  }

  private buildMeta(extra?: Record<string, unknown>) {
    return {
      requestId: this.cls.get?.('requestId'),
      traceId: this.cls.get?.('traceId'),
      context: this.context,
      ...extra,
    };
  }

  log(message: string, meta?: Record<string, unknown>) {
    this.pino.info(this.buildMeta(meta), message);
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.pino.error(this.buildMeta(meta), message);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.pino.warn(this.buildMeta(meta), message);
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.pino.debug(this.buildMeta(meta), message);
  }

  silly(message: string, meta?: Record<string, unknown>) {
    this.pino.trace(this.buildMeta(meta), message);
  }
}
