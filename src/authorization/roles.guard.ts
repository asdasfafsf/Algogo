import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../common/decorators/authorization/roles.decorator';
import { CustomForbiddenException } from '../common/errors/CustomForbiddenException';
import { Role } from '../common/types/roles.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles || roles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new CustomForbiddenException({
        code: 'FORBIDDEN',
        message: '로그인 후 이용해주세요.',
      });
    }

    const userRoles: Role[] = user.roles ?? [];

    if (!userRoles.some((role) => roles.includes(role))) {
      throw new CustomForbiddenException({
        code: 'FORBIDDEN',
        message: '권한이 없습니다.',
      });
    }

    return true;
  }
}
