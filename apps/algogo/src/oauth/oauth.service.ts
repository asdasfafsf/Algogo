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

    const oauthList = await this.oauthRepository.getOAuthList({
      id,
      provider,
    });

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
    const { id, provider, userUuid } = requestOAuthConnectDto;
    const oauthList = await this.oauthRepository.getOAuthList({
      id,
      provider,
    });

    if (!oauthList?.length) {
      return OAuthState.NEW;
    }

    const isConnectedToOther = oauthList.some(
      (elem) => elem.isActive && elem.userUuid !== userUuid,
    );

    if (isConnectedToOther) {
      return OAuthState.CONNECTED_TO_OTHER_ACCOUNT;
    }

    const mine = oauthList.find((elem) => elem.userUuid === userUuid);

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
    try {
      const oauthState = await this.getOAuthState(requestOAuthDto);
      let userNo = -1;
      let userUuid = '';

      if (oauthState === OAuthState.NEW) {
        const user = await this.oauthRepository.insertUser(requestOAuthDto);
        userNo = user.no;
        userUuid = user.uuid;
      } else if (oauthState === OAuthState.CONNECTED_TO_OTHER_ACCOUNT) {
        const { id, provider } = requestOAuthDto;
        const user = await this.oauthRepository.getOAuth({
          id,
          provider,
          isActive: true,
        });
        userUuid = user.userUuid;
      } else {
        const { id, provider } = requestOAuthDto;
        const user = await this.oauthRepository.getOAuth({
          id,
          provider,
          isActive: false,
        });
        userUuid = user.userUuid;
        await this.oauthRepository.updateUserOAuth({
          userUuid,
          id,
          provider,
          isActive: true,
        });
        // throw new ConflictException('연동해제된 계정입니다. 계속 진행할까요?');
      }

      if (userNo === -1) {
        userNo = await this.oauthRepository.getUserNo(userUuid);

        if (!userNo) {
          throw new ConflictException(
            '연동해제된 계정입니다. 계속 진행할까요?',
          );
        }
      }

      const uuid = await this.authService.generateLoginToken({
        userNo,
        userUuid,
      });
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
    const userOAuth = await this.oauthRepository.getOAuth({
      id,
      provider,
      isActive: true,
    });

    // 동일한 계정으로 이미 연동 됨
    if (userOAuth) {
      throw new ConflictException('이미 연동 된 계정입니다.');
    }

    const { userUuid } = requestOAuthDto;

    const myUserOAuth = await this.oauthRepository.getUserOAuth({
      userUuid,
      provider,
    });

    if (myUserOAuth?.isActive) {
      throw new ConflictException(
        '이미 연동 된 유형입니다. 연동 해제 후 이용해주세요.',
      );
    }

    await this.oauthRepository.addOAuthProvider(requestOAuthDto);
  }

  async disconnectOAuth({
    userUuid,
    provider,
  }: {
    userUuid: string;
    provider: OAuthProvider;
  }) {
    const myOAuth = await this.oauthRepository.getUserOAuth({
      userUuid,
      provider,
      isActive: true,
    });

    if (!myOAuth) {
      throw new NotFoundException('연동되지 않은 인증기관입니다.');
    }

    await this.oauthRepository.disconnectOAuth({
      userUuid,
      provider,
    });
  }
}
