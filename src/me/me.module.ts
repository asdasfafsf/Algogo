import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { MeRepository } from './me.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Module } from '../s3/s3.module';
import { CryptoModule } from '../crypto/crypto.module';
import { ImageModule } from '../image/image.module';
import { AuthGuardModule } from '../auth-guard/auth-guard.module';

@Module({
  controllers: [MeController],
  providers: [MeService, MeRepository],
  imports: [PrismaModule, AuthGuardModule, S3Module, CryptoModule, ImageModule],
  exports: [],
})
export class MeModule {}
