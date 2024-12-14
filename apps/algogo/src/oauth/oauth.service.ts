import { RequestOAuthDto } from '@libs/core/dto/RequestOAuthDto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { OauthRepository } from './oauth.repository';
import { CustomLogger } from '../logger/custom-logger';

@Injectable()
export class OauthService {
  constructor(
    private readonly logger: CustomLogger,
    private readonly authService: AuthService,
    private readonly oauthRepository: OauthRepository,
  ) {}
  async login(requestOAuthDto: RequestOAuthDto) {
    const { id, provider } = requestOAuthDto;

    try {
      const userOAuth = await this.oauthRepository.getUserOAuth(id, provider);
      let userNo = -1;
      if (!userOAuth) {
        const user = await this.oauthRepository.insertUser(requestOAuthDto);
        userNo = user.no;
      } else {
        userNo = userOAuth.userNo;
      }

      if (userNo === -1 || !userNo) {
        throw new InternalServerErrorException('oauth error');
      }

      const uuid = await this.authService.generateLoginToken(userNo);
      return uuid;
    } catch (e) {
      this.logger.error('OauthService registerOrLogin', {
        error: e,
      });

      throw e;
    }
  }

  async addOAuthProvider() {}
}
