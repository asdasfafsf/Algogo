import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersRepository } from './users.repository'; 
import { AuthGuardModule } from '../auth-guard/auth-guard.module';

@Module({
  imports: [PrismaModule, AuthGuardModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
