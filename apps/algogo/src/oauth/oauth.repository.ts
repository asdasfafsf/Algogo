import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestOAuthDto } from './dto/RequestOAuthDto';
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';
import { RequestOAuthConnectDto } from './dto/RequestOAuthConnectDto';

@Injectable()
export class OauthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getOAuth(id: string, provider: string) {
    return await this.prismaService.userOAuth.findUnique({
      select: {
        userNo: true,
        isActive: true,
      },
      where: {
        id_provider: {
          id,
          provider,
        },
        isActive: true,
      },
    });
  }
  async getActiveUserOAuth(id: string, provider: OAuthProvider) {
    return await this.prismaService.userOAuth.findUnique({
      select: {
        userNo: true,
        isActive: true,
      },
      where: {
        id_provider: {
          id,
          provider,
        },
        isActive: true,
      },
    });
  }

  async getUserOAuth(
    userNo: number,
    provider: OAuthProvider,
    isActive: boolean = false,
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

  async addOAuthProvider(requestOAuthConnectDto: RequestOAuthConnectDto) {
    const { userNo, provider, id } = requestOAuthConnectDto;

    const upsertedUserOAuth = await this.prismaService.userOAuth.upsert({
      select: { userNo: true },
      where: {
        userNo_provider: {
          userNo,
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
    console.log('??너는왜오류안남십탱아');
    const res = await this.prismaService.userOAuth.update({
      select: {
        userNo: true,
        provider: true,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
      where: {
        userNo_provider: {
          userNo,
          provider,
        },
      },
    });
    console.log('???무슨일이세요');
    console.log(res);
  }
}
