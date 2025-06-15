import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestOAuthDto } from './dto/RequestOAuthDto';
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';
import { RequestOAuthConnectDto } from './dto/RequestOAuthConnectDto';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class OauthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getOAuthList({
    id,
    provider,
  }: {
    id: string;
    provider: OAuthProvider;
  }) {
    return await this.prismaService.userOAuth.findMany({
      select: {
        userUuid: true,
        isActive: true,
      },
      where: {
        id,
        provider,
      },
    });
  }

  async getOAuth({
    id,
    provider,
    isActive,
  }: {
    id: string;
    provider: OAuthProvider;
    isActive?: boolean;
  }) {
    return await this.prismaService.userOAuth.findFirst({
      select: {
        userUuid: true,
      },
      where: {
        id,
        provider,
        isActive,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getUserOAuth({
    userUuid,
    provider,
    isActive,
  }: {
    userUuid: string;
    provider: OAuthProvider;
    isActive?: boolean;
  }) {
    return await this.prismaService.userOAuth.findFirst({
      select: {
        userUuid: true,
        isActive,
      },
      where: {
        userUuid,
        provider,
      },
    });
  }

  async updateUserOAuth({
    userUuid,
    id,
    provider,
    isActive,
  }: {
    userUuid: string;
    id: string;
    provider: OAuthProvider;
    isActive: boolean;
  }) {
    return await this.prismaService.userOAuth.update({
      select: {
        userUuid: true,
      },
      data: {
        isActive,
        updatedAt: new Date(),
      },
      where: {
        userUuid_id_provider: {
          userUuid,
          id,
          provider,
        },
      },
    });
  }

  async addOAuthProvider(requestOAuthConnectDto: RequestOAuthConnectDto) {
    const { provider, id, userUuid } = requestOAuthConnectDto;

    const upsertedUserOAuth = await this.prismaService.userOAuth.upsert({
      select: { userUuid: true },
      where: {
        userUuid_id_provider: {
          userUuid,
          id,
          provider,
        },
      },
      update: {
        id,
        isActive: true,
      },
      create: {
        id,
        provider,
        userUuid,
        isActive: true,
      },
    });

    return upsertedUserOAuth;
  }

  async insertUser(requestOAuthDto: RequestOAuthDto) {
    const { id, email, provider, name } = requestOAuthDto;
    const uuid = uuidv7();
    console.log('야야야', requestOAuthDto);
    const user = await this.prismaService.user.create({
      select: {
        no: true,
        uuid: true,
      },
      data: {
        name,
        email,
        emailVerified: false,
        profilePhoto: '',
        lastLoginDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        uuid,
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

  async getUserNo(userUuid: string) {
    const user = await this.prismaService.user.findUnique({
      select: { no: true },
      where: { uuid: userUuid },
    });
    return user?.no;
  }

  async disconnectOAuth({
    userUuid,
    provider,
  }: {
    userUuid: string;
    provider: OAuthProvider;
  }) {
    await this.prismaService.userOAuth.updateMany({
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
      where: {
        userUuid,
        provider: provider,
        isActive: true,
      },
    });
  }
}
