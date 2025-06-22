import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../authorization/roles.guard';
import { AuthGuard } from '../auth-guard/auth.guard';
import { Roles } from '../common/decorators/authorization/roles.decorator';
import { ROLES } from '../common/constants/roles.constants';
import { ProblemSiteService } from './problem-site.service';
import { CreateProblemSiteDto } from './dto/create-problem-site.dto';
import { TokenUser } from 'src/common/types/request.type';
import { User } from 'src/common/decorators/contexts/user.decorator';
import { ProblemSiteProvider } from 'src/common/types/problem-site.type';

@Controller('api/v1/problem-site')
@UseGuards(AuthGuard, RolesGuard)
@Roles([ROLES.VIP, ROLES.ADMIN])
export class ProblemSiteController {
  constructor(private readonly problemSiteService: ProblemSiteService) {}

  @Post()
  async createProblemSite(
    @User() user: TokenUser,
    @Body() createProblemSiteDto: CreateProblemSiteDto,
  ) {
    return this.problemSiteService.createProblemSite({
      ...createProblemSiteDto,
      userUuid: user.sub,
    });
  }

  @Delete('/:provider')
  async deleteProblemSite(
    @User() user: TokenUser,
    @Param('provider') provider: ProblemSiteProvider,
  ) {
    return this.problemSiteService.deleteProblemSite({
      userUuid: user.sub,
      provider,
    });
  }
}
