import { RequestOAuthDto } from './dto/RequestOAuthDto';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { OauthRepository } from './oauth.repository';
import { CustomLogger } from '../logger/custom-logger';
import { RequestOAuthConnectDto } from './dto/RequestOAuthConnectDto';
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';
import { OAuthState } from './constants/OAuthState';

@Injectable()
export class OauthService {
  constructor(
    private readonly logger: CustomLogger,
    private readonly authService: AuthService,
    private readonly oauthRepository: OauthRepository,
  ) {}

  async getOAuthState(
    requestOAuthDto: RequestOAuthDto,
  ): Promise<(typeof OAuthState)[keyof typeof OAuthState]> {
    const { id, provider } = requestOAuthDto;

    const oauth = await this.oauthRepository.getOAuth(id, provider);

    if (!oauth) {
      return OAuthState.NEW;
    }

    if (oauth.isActive === true) {
      return OAuthState.CONNECTED_TO_OTHER_ACCOUNT;
    }
    return OAuthState.DISCONNECTED_FROM_OTHER_ACCOUNT;
  }

  async getOAuthStateWithLogined(
    requestOAuthConnectDto: RequestOAuthConnectDto,
  ) {
    const { userNo, id, provider } = requestOAuthConnectDto;
    const oauth = await this.oauthRepository.getOAuth(id, provider);

    if (!oauth) {
      return OAuthState.NEW;
    }

    if (oauth.userNo === userNo) {
      if (oauth.isActive === true) {
        return OAuthState.CONNECTED_AND_ACTIVE;
      }
      return OAuthState.CONNECTED_AND_INACTIVE;
    }

    if (oauth.isActive === true) {
      return OAuthState.CONNECTED_TO_OTHER_ACCOUNT;
    }

    return OAuthState.DISCONNECTED_FROM_OTHER_ACCOUNT;
  }

  async login(requestOAuthDto: RequestOAuthDto) {
    this.logger.silly('start login', requestOAuthDto);
    const { id, provider } = requestOAuthDto;

    try {
      const userOAuth = await this.oauthRepository.getActiveUserOAuth(
        id,
        provider,
      );
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

  async connectOAuthProvider(requestOAuthDto: RequestOAuthConnectDto) {
    const { id, provider } = requestOAuthDto;
    const userOAuth = await this.oauthRepository.getActiveUserOAuth(
      id,
      provider,
    );

    this.logger.silly('complete duplicate your oauth', userOAuth);
    // 동일한 계정으로 이미 연동 됨
    if (userOAuth) {
      throw new ConflictException('이미 연동 된 계정입니다.');
    }

    this.logger.silly('complete duplicate your oauth', {});
    const { userNo } = requestOAuthDto;

    const myUserOAuth = await this.oauthRepository.getUserOAuth(
      userNo,
      provider,
      true,
    );

    this.logger.silly('complete duplicate my oauth', myUserOAuth);
    if (myUserOAuth?.isActive) {
      throw new ConflictException(
        '이미 연동 된 유형입니다. 연동 해제 후 이용해주세요.',
      );
    }

    this.logger.silly('start connect oauth', {});

    await this.oauthRepository.addOAuthProvider(requestOAuthDto);
  }

  async disconnectOAuth(userNo: number, provider: OAuthProvider) {
    const myOAuth = await this.oauthRepository.getUserOAuth(
      userNo,
      provider,
      true,
    );

    if (!myOAuth) {
      throw new NotFoundException('연동되지 않은 인증기관입니다.');
    }

    await this.oauthRepository.disconnectOAuth(userNo, provider);
  }
}
