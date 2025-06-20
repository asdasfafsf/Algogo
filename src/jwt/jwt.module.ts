import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';

@Module({
  imports: [NestJwtModule.register({})],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
