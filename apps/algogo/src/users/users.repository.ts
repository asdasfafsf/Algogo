import { uuidv7 } from 'uuidv7';
import { PrismaService } from '../prisma/prisma.service';
import { InquiryUserDto } from './dto/InquiryUserDto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getUser(inquiryUserDto: InquiryUserDto) {
    const { userNo, uuid } = inquiryUserDto;
    const user = await this.prismaService.user.findUnique({
      select: {
        no: true,
        uuid: true,
        name: true,
        email: true,
        profilePhoto: true,
        socialList: {
          select: {
            provider: true,
            content: true,
          },
        },
        oauthList: {
          select: {
            provider: true,
          },
        },
      },
      where: {
        uuid,
      },
    });

    if (!user) {
      return user;
    }

    if (userNo !== user.no) {
      user.oauthList = undefined;
    }

    user.no = undefined;

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
}
