import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestOAuthDto } from './dto/RequestOAuthDto';
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';
import { RequestOAuthConnectDto } from './dto/RequestOAuthConnectDto';

@Injectable()
export class OauthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserOAuth(id: string, provider: OAuthProvider) {
    return await this.prismaService.userOAuth.findUnique({
      select: {
        userNo: true,
      },
      where: {
        id_provider: {
          id,
          provider,
        },
      },
    });
  }

  async getMyOAuth(userNo: number, provider: OAuthProvider) {
    return await this.prismaService.userOAuth.findFirst({
      select: {
        userNo: true,
      },
      where: {
        userNo,
        provider,
      },
    });
  }

  async addOAuthProvider(requestOAuthConnectDto: RequestOAuthConnectDto) {
    const { userNo, provider, id } = requestOAuthConnectDto;

    const createdUserOAuth = await this.prismaService.userOAuth.create({
      select: { userNo: true },
      data: {
        id,
        provider,
        userNo,
      },
    });

    return createdUserOAuth;
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
        },
      });

      const { no } = user;

      await prisma.userOAuth.create({
        data: {
          id,
          userNo: no,
          provider,
        },
      });

      return user;
    });

    return user;
  }
}
