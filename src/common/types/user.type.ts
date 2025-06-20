import { USER_STATE } from '../constants/user.constant';

export type UserState = (typeof USER_STATE)[keyof typeof USER_STATE];

export type UserSummary = {
  uuid: string;
  state: UserState;
};
