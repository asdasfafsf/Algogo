import { RequestOAuthDto } from './dto/RequestOAuthDto';
import {
  ConflictException,
  Injectable,
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

  async getOAuthState(requestOAuthDto: RequestOAuthDto) {
    const { id, provider } = requestOAuthDto;

    const oauthList = await this.oauthRepository.getOAuthList(id, provider);

    if (!oauthList?.length) {
      return OAuthState.NEW;
    }

    const target = oauthList.find((elem) => elem.isActive);

    if (target) {
      return OAuthState.CONNECTED_TO_OTHER_ACCOUNT;
    }

    return OAuthState.DISCONNECTED_FROM_OTHER_ACCOUNT;
  }

  async getOAuthStateWithLogined(
    requestOAuthConnectDto: RequestOAuthConnectDto,
  ) {
    const { userNo, id, provider } = requestOAuthConnectDto;
    const oauthList = await this.oauthRepository.getOAuthList(id, provider);

    if (!oauthList?.length) {
      return OAuthState.NEW;
    }

    const isConnectedToOther = oauthList.some(
      (elem) => elem.isActive && elem.userNo !== userNo,
    );

    if (isConnectedToOther) {
      return OAuthState.CONNECTED_TO_OTHER_ACCOUNT;
    }

    const mine = oauthList.find((elem) => elem.userNo === userNo);

    if (mine) {
      if (mine.isActive) {
        return OAuthState.CONNECTED_AND_ACTIVE;
      } else {
        return OAuthState.CONNECTED_AND_INACTIVE;
      }
    }

    return OAuthState.DISCONNECTED_FROM_OTHER_ACCOUNT;
  }

  async login(requestOAuthDto: RequestOAuthDto) {
    this.logger.silly('start login', requestOAuthDto);

    try {
      const oauthState = await this.getOAuthState(requestOAuthDto);
      let userNo = -1;

      if (oauthState === OAuthState.NEW) {
        const user = await this.oauthRepository.insertUser(requestOAuthDto);
        userNo = user.no;
      } else if (oauthState === OAuthState.CONNECTED_TO_OTHER_ACCOUNT) {
        const { id, provider } = requestOAuthDto;
        const user = await this.oauthRepository.getOAuth(id, provider, true);
        userNo = user.userNo;
      } else {
        const { id, provider } = requestOAuthDto;
        const user = await this.oauthRepository.getOAuth(id, provider, true);
        userNo = user.userNo;
        // throw new ConflictException('연동해제된 계정입니다. 계속 진행할까요?');
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
    const userOAuth = await this.oauthRepository.getOAuth(id, provider, true);

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
