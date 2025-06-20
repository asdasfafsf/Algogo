import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { OauthV2Repository } from './oauth-v2.repository';
import { OAuthProvider } from '../common/types/oauth.type';
import { OAUTH_STATE } from '../common/constants/oauth.contant';
import { AuthV2Service } from '../auth-v2/auth-v2.service';
import { OAuthConflictException } from '../common/errors/oauth/OAuthConflictException';

@Injectable()
export class OauthV2Service {
  constructor(
    private readonly oauthV2Repository: OauthV2Repository,
    private readonly usersService: UsersService,
    private readonly authV2Service: AuthV2Service,
  ) {}

  /**
   * OAuth 상태 조회
   * @param id 유저 아이디
   * @param provider 프로바이더
   * @param userUuid 유저 아이디
   * @returns OAuth 상태
   */
  async getOAuthState({
    id,
    provider,
    userUuid,
  }: {
    id: string;
    provider: OAuthProvider;
    userUuid?: string;
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
        ? userUuid && oauth.userUuid === userUuid
          ? OAUTH_STATE.CONNECTED_AND_ACTIVE
          : OAUTH_STATE.CONNECTED_TO_OTHER_ACCOUNT
        : userUuid && oauth.userUuid === userUuid
          ? OAUTH_STATE.CONNECTED_AND_INACTIVE
          : OAUTH_STATE.DISCONNECTED_FROM_OTHER_ACCOUNT,
      user: oauth,
    };
  }

  /**
   * 유저 등록 또는 로그인
   * @param id 유저 아이디
   * @param provider 프로바이더
   * @param name 이름
   * @param email 이메일
   * @returns 액세스 토큰, 리프레시 토큰
   */
  async registerOrLogin({
    id,
    provider,
    name,
    email,
    ip,
    userAgent,
  }: {
    id: string;
    provider: OAuthProvider;
    name: string;
    email: string;
    ip: string;
    userAgent: string;
  }) {
    const oauthState = await this.getOAuthState({ id, provider });
    let userUuid = '';
    if (oauthState.state === OAUTH_STATE.NEW) {
      const user = await this.usersService.createUser({
        id,
        provider,
        name,
        email,
      });
      userUuid = user.uuid;
    } else if (oauthState.state === OAUTH_STATE.CONNECTED_AND_ACTIVE) {
      // 정상적으로 연동되었다면 로그인해야함.
      userUuid = oauthState.user.userUuid;
    } else if (oauthState.state === OAUTH_STATE.CONNECTED_AND_INACTIVE) {
      // 이미 연동되어있었다면 우선 연동시킴
      await this.oauthV2Repository.updateUserOAuth({
        id,
        provider,
        userUuid: oauthState.user.userUuid,
        isActive: true,
      });
      userUuid = oauthState.user.userUuid;
    } else if (oauthState.state === OAUTH_STATE.CONNECTED_TO_OTHER_ACCOUNT) {
      // 정상적으로 연동되었다면 로그인해야함.
      userUuid = oauthState.user.userUuid;
    } else if (
      oauthState.state === OAUTH_STATE.DISCONNECTED_FROM_OTHER_ACCOUNT
    ) {
      // 로그인일때 우선 정지 안하고 그냥 로그인 시키자..
      await this.oauthV2Repository.updateUserOAuth({
        id,
        provider,
        userUuid: oauthState.user.userUuid,
        isActive: true,
      });
      userUuid = oauthState.user.userUuid;
    }

    const { accessToken, refreshToken } = await this.authV2Service.login({
      userUuid: userUuid,
      ip,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * OAuth 연동
   * @param id 유저 아이디
   * @param provider 프로바이더
   * @param userUuid 유저 아이디
   * @returns null;
   * @throws OAuthConflictException;
   */
  async connectOAuthProvider({
    id,
    provider,
    userUuid,
  }: {
    id: string;
    provider: OAuthProvider;
    userUuid: string;
  }) {
    const oauthState = await this.getOAuthState({ id, provider });
    if (oauthState.state === OAUTH_STATE.NEW) {
      await this.oauthV2Repository.createUserOAuth({
        id,
        provider,
        userUuid,
      });
    } else if (oauthState.state === OAUTH_STATE.CONNECTED_AND_ACTIVE) {
      // 정상 아무것도 안함
    } else if (oauthState.state === OAUTH_STATE.CONNECTED_AND_INACTIVE) {
      // 내 계정에 이전에 연동되어있었다면 우선 연동시킴
      await this.oauthV2Repository.updateUserOAuth({
        id,
        provider,
        userUuid,
        isActive: true,
      });
    } else if (oauthState.state === OAUTH_STATE.CONNECTED_TO_OTHER_ACCOUNT) {
      throw new OAuthConflictException();
    } else if (
      oauthState.state === OAUTH_STATE.DISCONNECTED_FROM_OTHER_ACCOUNT
    ) {
      throw new OAuthConflictException();
    }
  }

  /**
   * OAuth 연동 해제
   * @param id 유저 아이디
   * @param provider 프로바이더
   * @param userUuid 유저 아이디
   * @returns null;
   * @throws OAuthConflictException;
   */
  async disconnectOAuthProvider({
    id,
    provider,
    userUuid,
  }: {
    id: string;
    provider: OAuthProvider;
    userUuid: string;
  }) {
    await this.oauthV2Repository.updateUserOAuth({
      id,
      provider,
      userUuid,
      isActive: false,
    });
  }
}
