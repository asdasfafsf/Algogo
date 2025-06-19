import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';

import { USER_NOT_FOUND_MESSAGE } from './constants';
import { OAuthProvider } from '../common/types/oauth.type';
import { UserInactiveException } from '../common/errors/user/UserInactiveException';
import { UserNotFoundException } from '../common/errors/user/UserNotFoundException';
import { UserState, UserSummary } from '../common/types/user.type';
import { USER_STATE } from '../common/constants/user.constant';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * 유저 조회
   * @param userUuid 유저 고유 아이디
   * @returns 유저 정보
   */
  async getUser({ userUuid }: { userUuid: string }) {
    const user = await this.usersRepository.findUser({
      userUuid,
    });

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    return {
      ...user,
    };
  }

  /**
   * 유저 생성
   * @param provider 소셜 플랫폼
   * @param id 소셜 플랫폼 고유 아이디
   * @param name 유저 이름
   * @param email 유저 이메일
   * @returns {User} 유저 정보
   */
  async createUser({
    provider,
    id,
    name,
    email,
  }: {
    provider: OAuthProvider;
    id: string;
    name: string;
    email: string;
  }) {
    const user = await this.usersRepository.createUser({
      provider,
      id,
      name,
      email,
    });

    return user;
  }

  /**
   * 유저 검증
   * @param userUuid 유저 고유 아이디
   * @returns {UserSummary} 유저 정보
   * @throws {UserNotFoundException} 유저가 존재하지 않을 때
   * @throws {UserInactiveException} 유저가 비활성화되었을 때
   */
  async validateUser(userUuid: string): Promise<UserSummary> {
    const user = await this.usersRepository.findUserSummaryByUuid(userUuid);

    if (!user) {
      throw new UserNotFoundException();
    }

    if (user.state === USER_STATE.INACTIVE) {
      throw new UserInactiveException();
    }

    return {
      ...user,
      state: user.state as UserState,
    };
  }

  async insertLoginHistory({
    userUuid,
    type,
    ip,
    userAgent,
  }: {
    userUuid: string;
    type: string;
    ip: string;
    userAgent: string;
  }) {
    await this.usersRepository.insertLoginHistory({
      userUuid,
      type,
      ip,
      userAgent,
    });
  }
}
