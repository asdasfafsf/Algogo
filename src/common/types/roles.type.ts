import { ROLES } from '../constants/roles.constants';

export type Role = (typeof ROLES)[keyof typeof ROLES];
