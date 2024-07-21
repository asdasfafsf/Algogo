import { RequestOAuthDto } from '@libs/core/dto/RequestOAuthDto';
import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from 'winston';

@Injectable()
export class OauthService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}
  async registerOrLogin(requestOAuthDto: RequestOAuthDto) {
    const { id, email, provider, name } = requestOAuthDto;

    try {
      const userOAuth = await this.prismaService.userOAuth.findUnique({
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

      if (userOAuth) {
        const { userNo } = userOAuth;
        const user = await this.prismaService.user.findUnique({
          select: {
            no: true,
          },
          where: {
            no: userNo,
          },
        });

        this.logger.silly('OauthService Login', user);
        return user;
      }

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

      this.logger.silly('Oauth registeted user', user);

      return user;
    } catch (e) {
      this.logger.error('OauthService registerOrLogin', {
        error: e,
      });

      throw e;
    }
  }
}
