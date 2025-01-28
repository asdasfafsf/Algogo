import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getUser(userNo: number) {
    const user = await this.prismaService.user.findUnique({
      select: {
        no: true,
        uuid: true,
        state: true,
      },
      where: {
        no: userNo,
      },
    });

    return user;
  }
}
