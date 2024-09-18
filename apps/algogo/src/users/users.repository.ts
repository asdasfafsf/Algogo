import { PrismaService } from '../prisma/prisma.service';
import { InquiryUserDto } from './dto/InquiryUserDto';

export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getUser(inquiryUserDto: InquiryUserDto) {
    const { userNo, uuid } = inquiryUserDto;
    const user = await this.prismaService.user.findUnique({
      select: {
        no: true,
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
            provider: true,
          },
        },
      },
      where: {
        uuid,
      },
    });

    if (!user) {
      return user;
    }

    if (userNo !== user.no) {
      user.oauthList = undefined;
    }

    user.no = undefined;

    return user;
  }
}
