import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestOAuthDto } from '@libs/core/dto/RequestOAuthDto';

@Injectable()
export class OauthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserOAuth(id: string, provider: 'google' | 'github' | 'kakao') {
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
