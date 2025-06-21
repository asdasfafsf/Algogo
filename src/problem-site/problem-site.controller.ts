import { Controller, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../authorization/roles.guard';
import { AuthGuard } from '../auth-guard/auth.guard';
import { Roles } from '../common/decorators/authorization/roles.decorator';
import { ROLES } from '../common/constants/roles.constants';

@Controller('api/v1/problem-site')
@UseGuards(AuthGuard, RolesGuard)
@Roles([ROLES.VIP, ROLES.ADMIN])
export class ProblemSiteController {
  async putProblemSiteAccount() {}

  async deleteProblemSiteAccount() {}
}
