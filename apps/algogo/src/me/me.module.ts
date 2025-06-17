import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { MeRepository } from './me.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { S3Module } from '../s3/s3.module';
import { CryptoModule } from '../crypto/crypto.module';
import { ImageModule } from '../image/image.module';
import { AuthV2Module } from '../auth-v2/auth-v2.module';

@Module({
  controllers: [MeController],
  providers: [MeService, MeRepository],
  imports: [
    PrismaModule,
    AuthModule,
    S3Module,
    CryptoModule,
    ImageModule,
    AuthV2Module,
  ],
  exports: [],
})
export class MeModule {}
