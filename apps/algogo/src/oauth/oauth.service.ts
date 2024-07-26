import { RequestOAuthDto } from '@libs/core/dto/RequestOAuthDto';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from 'winston';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class OauthService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('winston')
    private readonly logger: Logger,
    private readonly authService: AuthService,
  ) {}
  async login(requestOAuthDto: RequestOAuthDto) {
    const { id, provider } = requestOAuthDto;

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

      let userNo = -1;
      if (userOAuth) {
        const user = await this.register(requestOAuthDto);
        userNo = user.no;
      }

      if (!userNo) {
        throw new InternalServerErrorException('oauth error');
      }

      const uuid = await this.authService.generateLoginToken(userNo);

      this.logger.silly('OauthService Login', {});

      return uuid;
    } catch (e) {
      this.logger.error('OauthService registerOrLogin', {
        error: e,
      });

      throw e;
    }
  }

  async register(requestOAuthDto: RequestOAuthDto) {
    const { id, email, provider, name } = requestOAuthDto;
    try {
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
    } catch (e) {
      this.logger.error('oauth register', {
        error: e,
      });
    }
  }
}
