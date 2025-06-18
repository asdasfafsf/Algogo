import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { OauthV2Repository } from './oauth-v2.repository';
import { OAuthProvider } from './types/oauth.type';
import { OAUTH_STATE } from './constants/oauth.contant';
import { AuthV2Service } from '../auth-v2/auth-v2.service';
import { OAuthConflictException } from '../common/errors/oauth/OAuthConflictException';

@Injectable()
export class OauthV2Service {
  constructor(
    private readonly oauthV2Repository: OauthV2Repository,
    private readonly usersService: UsersService,
    private readonly authV2Service: AuthV2Service,
  ) {}

  async getOAuthState({
    id,
    provider,
  }: {
    id: string;
    provider: OAuthProvider;
  }) {
    const oauth = await this.oauthV2Repository.findOne({ id, provider });

    if (!oauth) {
      return {
        state: OAUTH_STATE.NEW,
        user: null,
      };
    }

    return {
      state: oauth.isActive
        ? OAUTH_STATE.CONNECTED_AND_ACTIVE
        : OAUTH_STATE.CONNECTED_AND_INACTIVE,
      user: oauth,
    };
  }

  async registerOrLogin({
    id,
    provider,
    name,
    email,
  }: {
    id: string;
    provider: OAuthProvider;
    name: string;
    email: string;
  }) {
    const oauthState = await this.getOAuthState({ id, provider });
    let userUuid = '';
    if (oauthState.state === OAUTH_STATE.NEW) {
      const user = await this.registerUser({ id, provider, name, email });
      userUuid = user.uuid;
    } else if (oauthState.state === OAUTH_STATE.CONNECTED_AND_ACTIVE) {
      // 정상적으로 연동되었다면 로그인해야함.
      userUuid = oauthState.user.userUuid;
    } else if (oauthState.state === OAUTH_STATE.CONNECTED_AND_INACTIVE) {
      throw new OAuthConflictException();
    } else if (oauthState.state === OAUTH_STATE.DISCONNECTED) {
      throw new OAuthConflictException();
    } else if (oauthState.state === OAUTH_STATE.CONNECTED_TO_OTHER_ACCOUNT) {
      throw new OAuthConflictException();
    } else if (
      oauthState.state === OAUTH_STATE.DISCONNECTED_FROM_OTHER_ACCOUNT
    ) {
      throw new OAuthConflictException();
    }

    console.log('userUuid', userUuid);
    console.log('oauthState', oauthState);

    const { accessToken, refreshToken } = await this.authV2Service.login({
      userUuid: userUuid,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async registerUser({
    id,
    provider,
    name,
    email,
  }: {
    id: string;
    provider: OAuthProvider;
    name: string;
    email: string;
  }) {
    const user = await this.usersService.createUser({
      provider,
      id,
      name,
      email,
    });

    return user;
  }
}
