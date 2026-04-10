import { Inject, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import appConfig from '../config/appConfig';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(appConfig.KEY)
    appCfg: ConfigType<typeof appConfig>,
  ) {
    super(
      appCfg.isDevelopment
        ? { log: ['query', 'info', 'warn', 'error'] }
        : {},
    );
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
