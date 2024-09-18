import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Logger, createLogger, format, transports } from 'winston';
import LoggerConfig from '../config/LoggerConfig';

@Injectable()
export class CustomLogger {
  private readonly logger: Logger;

  constructor(
    private readonly context: string,
    @Inject(LoggerConfig.KEY)
    private readonly loggerConfig: ConfigType<typeof LoggerConfig>,
  ) {
    this.logger = createLogger({
      level: loggerConfig.level,
      format: format.combine(
        format.timestamp(),
        format.json(),
        format.printf(({ timestamp, level, message, context }) => {
          return `${timestamp} [${context}] ${level}: ${message}`;
        }),
      ),
      transports: [new transports.Console()],
    });
  }

  log(message: string, meta?: any, callback?: () => void) {
    this.logger.info(message, { context: this.context, ...meta }, callback);
  }

  error(message: string, meta?: any, callback?: () => void) {
    this.logger.error(message, { context: this.context, ...meta }, callback);
  }

  warn(message: string, meta?: any, callback?: () => void) {
    this.logger.warn(message, { context: this.context, ...meta }, callback);
  }

  debug(message: string, meta?: any, callback?: () => void) {
    this.logger.debug(message, { context: this.context, ...meta }, callback);
  }

  verbose(message: string, meta?: any, callback?: () => void) {
    this.logger.verbose(message, { context: this.context, ...meta }, callback);
  }

  http(message: string, meta?: any, callback?: () => void) {
    this.logger.http(message, { context: this.context, ...meta }, callback);
  }

  silly(message: string, meta?: any, callback?: () => void) {
    this.logger.silly(message, { context: this.context, ...meta }, callback);
  }
}
