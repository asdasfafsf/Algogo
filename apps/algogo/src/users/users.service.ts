import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { InquiryUserDto } from './dto/InquiryUserDto';
import { USER_NOT_FOUND_MESSAGE } from './constants';
import { ResponseUserDto } from './dto/ResponseUserDto';
import { SocialProvider } from '../common/enums/SocialProviderEnum';
import { OAuthProvider } from '../oauth-v2/types/oauth.type';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUser(inquiryUserDto: InquiryUserDto): Promise<ResponseUserDto> {
    const user = await this.usersRepository.getUser(inquiryUserDto);

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    if (user.no) {
      if (inquiryUserDto.userNo !== user.no) {
        user.oauthList = undefined;
      }
    }
    user.no = undefined;

    return {
      ...user,
      socialList: user.socialList.map(({ provider, content }) => ({
        provider: provider as SocialProvider,
        content,
      })),
      oauthList: user?.oauthList?.map(({ provider }) => ({
        provider: provider as OAuthProvider,
      })),
    };
  }

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
}
