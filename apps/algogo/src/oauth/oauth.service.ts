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
    const { id, email, provider, accessToken, name } = requestOAuthDto;

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
        return {};
      }

      //   this.prismaService.$transaction(async (prisma) => {

      //     await this.prismaService.user.create({
      //         data: {
      //             name,
      //             email,
      //         }
      //     })
      //     await this.prismaService.userOAuth.create(),

      //   });

      this.logger.silly('OauthService registerOrLogin #1', userOAuth);
    } catch (e) {}
  }
}
