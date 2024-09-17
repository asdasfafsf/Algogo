import { Global, Module, Scope } from '@nestjs/common';
import { CustomLogger } from './custom-logger';
import LoggerConfig from '../config/LoggerConfig';
import { ConfigType } from '@nestjs/config';
import { INQUIRER } from '@nestjs/core';

@Global()
@Module({
  providers: [
    {
      provide: CustomLogger,
      scope: Scope.TRANSIENT,
      inject: [INQUIRER, LoggerConfig.KEY],
      useFactory: (
        parentClass: object,
        loggerConfig: ConfigType<typeof LoggerConfig>,
      ) => new CustomLogger(parentClass.constructor.name, loggerConfig),
    },
  ],
  exports: [CustomLogger],
})
export class LoggerModule {}
