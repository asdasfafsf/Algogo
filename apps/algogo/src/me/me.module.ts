import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { MeRepository } from './me.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { S3Module } from '../s3/s3.module';
import { FileModule } from 'apps/compiler/src/file/file.module';
import { CryptoModule } from '../crypto/crypto.module';
import { ImageModule } from '../image/image.module';

@Module({
  controllers: [MeController],
  providers: [MeService, MeRepository],
  imports: [
    PrismaModule,
    AuthModule,
    S3Module,
    FileModule,
    CryptoModule,
    ImageModule,
  ],
  exports: [],
})
export class MeModule {}
