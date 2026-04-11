import { Inject, Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'winston';

@Injectable()
export class AppLogger {
  private context = '';

  constructor(
    @Inject('winston')
    private readonly winston: Logger,
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
    this.winston.info(message, this.buildMeta(meta));
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.winston.error(message, this.buildMeta(meta));
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.winston.warn(message, this.buildMeta(meta));
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.winston.debug(message, this.buildMeta(meta));
  }

  silly(message: string, meta?: Record<string, unknown>) {
    this.winston.silly(message, this.buildMeta(meta));
  }
}
