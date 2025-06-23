import { Reflector } from '@nestjs/core';
import { Role } from '../../types/roles.type';

export const Roles = Reflector.createDecorator<Role[]>();
