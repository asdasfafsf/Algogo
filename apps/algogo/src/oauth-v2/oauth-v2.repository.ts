import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OAuthProvider } from './types/oauth.type';

@Injectable()
export class OauthV2Repository {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne({ id, provider }: { id: string; provider: OAuthProvider }) {
    const oauth = await this.prismaService.userOAuth.findUnique({
      select: {
        id: true,
        userUuid: true,
        provider: true,
        isActive: true,
      },
      where: {
        id_provider: {
          id,
          provider,
        },
      },
    });
    return oauth;
  }

  async findOneByUserUuid({
    userUuid,
    id,
    provider,
  }: {
    userUuid: string;
    id: string;
    provider: OAuthProvider;
  }) {
    const oauth = await this.prismaService.userOAuth.findUnique({
      select: {
        id: true,
        userUuid: true,
        provider: true,
        isActive: true,
      },
      where: {
        userUuid_id_provider: {
          userUuid,
          id,
          provider,
        },
      },
    });
    return oauth;
  }

  async createUserOAuth({
    userUuid,
    id,
    provider,
  }: {
    userUuid: string;
    id: string;
    provider: OAuthProvider;
  }) {
    const userOAuth = await this.prismaService.userOAuth.create({
      data: {
        userUuid,
        id,
        provider,
        isActive: true,
      },
    });

    return userOAuth;
  }


  async updateUserOAuth({
    id,
    provider,
    userUuid,
    isActive,
  }: {
    id: string;
    provider: OAuthProvider;
    userUuid: string;
    isActive: boolean;
  }) {
    const userOAuth = await this.prismaService.userOAuth.update({
      where: {
        userUuid_id_provider: {
          userUuid,
          id,
          provider,
        },
      },
      data: {
        isActive,
      },
    });

    return userOAuth;
  }
}
