import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestOAuthDto } from './dto/RequestOAuthDto';
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';
import { RequestOAuthConnectDto } from './dto/RequestOAuthConnectDto';

@Injectable()
export class OauthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getOAuthList(id: string, provider: string) {
    return await this.prismaService.userOAuth.findMany({
      select: {
        userNo: true,
        isActive: true,
      },
      where: {
        id,
        provider,
      },
    });
  }

  async getOAuth(id: string, provider: OAuthProvider, isActive?: boolean) {
    return await this.prismaService.userOAuth.findFirst({
      select: {
        userNo: true,
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

  async getUserOAuth(
    userNo: number,
    provider: OAuthProvider,
    isActive?: boolean,
  ) {
    return await this.prismaService.userOAuth.findFirst({
      select: {
        userNo: true,
        isActive,
      },
      where: {
        userNo,
        provider,
      },
    });
  }

  async updateUserOAuth(
    userNo: number,
    id: string,
    provider: OAuthProvider,
    isActive: boolean,
  ) {
    return await this.prismaService.userOAuth.update({
      select: {
        userNo: true,
      },
      data: {
        isActive,
        updatedAt: new Date(),
      },
      where: {
        userNo_id_provider: {
          userNo,
          id,
          provider,
        },
      },
    });
  }

  async addOAuthProvider(requestOAuthConnectDto: RequestOAuthConnectDto) {
    const { userNo, provider, id } = requestOAuthConnectDto;

    const upsertedUserOAuth = await this.prismaService.userOAuth.upsert({
      select: { userNo: true },
      where: {
        userNo_id_provider: {
          userNo,
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
        userNo,
        isActive: true,
      },
    });

    return upsertedUserOAuth;
  }

  async insertUser(requestOAuthDto: RequestOAuthDto) {
    const { id, email, provider, name } = requestOAuthDto;
    const user = await this.prismaService.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        select: {
          no: true,
        },
        data: {
          name,
          email,
          emailVerified: false,
          profilePhoto: '',
          lastLoginDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const { no } = user;

      await prisma.userOAuth.create({
        data: {
          id,
          userNo: no,
          provider,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return user;
    });

    return user;
  }

  async disconnectOAuth(userNo: number, provider: OAuthProvider) {
    await this.prismaService.userOAuth.updateMany({
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
      where: {
        userNo: userNo,
        provider: provider,
        isActive: true,
      },
    });
  }
}
