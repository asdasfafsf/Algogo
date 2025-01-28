import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMeDto } from './dto/UpdateMeDto';

@Injectable()
export class MeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getMe(userNo: number) {
    const user = await this.prismaService.user.findUnique({
      select: {
        uuid: true,
        name: true,
        email: true,
        profilePhoto: true,
        socialList: {
          select: {
            provider: true,
            content: true,
          },
        },
        oauthList: {
          select: {
            isActive: true,
            provider: true,
          },
          where: {
            isActive: true,
          },
        },
      },
      where: {
        no: userNo,
      },
    });

    return user;
  }

  async getUuid(userNo: number) {
    const user = await this.prismaService.user.findUnique({
      select: {
        uuid: true,
      },
      where: {
        no: userNo,
      },
    });

    return user.uuid;
  }

  async updateMe(updateMeDto: UpdateMeDto) {
    const { userNo, profilePhoto, name, socialList } = updateMeDto;

    const me = await this.prismaService.$transaction(async (prisma) => {
      await Promise.all(
        !socialList
          ? []
          : socialList?.map(({ provider, content }) =>
              prisma.userSocial.upsert({
                where: {
                  userNo_provider: {
                    provider,
                    userNo,
                  },
                },
                create: {
                  provider,
                  content,
                  userNo,
                },
                update: {
                  content,
                },
              }),
            ),
      );
      const user = await prisma.user.update({
        select: {
          no: false,
          uuid: true,
          profilePhoto: true,
          email: true,
          name: true,
          socialList: {
            select: {
              userNo: false,
              provider: true,
              content: true,
            },
          },
          oauthList: {
            select: {
              provider: true,
            },
            where: {
              isActive: true,
            },
          },
        },
        where: {
          no: userNo,
        },
        data: {
          profilePhoto,
          name,
        },
      });

      return user;
    });

    return me;
  }
}
