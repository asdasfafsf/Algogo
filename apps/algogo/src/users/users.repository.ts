import { uuidv7 } from 'uuidv7';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUser({ userUuid }: { userUuid: string }) {
    const user = await this.prismaService.user.findUnique({
      select: {
        no: false,
        uuid: true,
        name: true,
        email: true,
        profilePhoto: true,
      },
      where: {
        uuid: userUuid,
      },
    });

    if (!user) {
      return user;
    }

    return user;
  }

  async createUser({
    id,
    email,
    provider,
    name,
  }: {
    id: string;
    email: string;
    provider: string;
    name: string;
  }) {
    const uuid = uuidv7();
    const user = await this.prismaService.user.create({
      select: {
        no: true,
        uuid: true,
      },
      data: {
        uuid,
        name,
        email,
        emailVerified: false,
        profilePhoto: '',
        lastLoginDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        oauthList: {
          create: {
            id,
            provider,
            isActive: true,
          },
        },
      },
    });

    return user;
  }

  async findUserSummaryByUuid(uuid: string) {
    return this.prismaService.user.findUnique({
      select: {
        uuid: true,
        state: true,
        socialList: false,
        oauthList: false,
        profilePhoto: false,
        name: false,
        email: false,
        createdAt: false,
        updatedAt: false,
      },
      where: {
        uuid,
      },
    });
  }

  async insertLoginHistory({
    userUuid,
    type,
    ip,
    userAgent,
  }: {
    userUuid: string;
    type: string;
    ip: string;
    userAgent: string;
  }) {
    await this.prismaService.userLoginHistory.create({
      select: {
        no: true,
      },
      data: {
        userUuid,
        type,
        ip,
        userAgent
      },
    });
  }
}
