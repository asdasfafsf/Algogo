import { SOCIAL_PROVIDER } from '../constants/social.constant';

export type SocialProvider =
  (typeof SOCIAL_PROVIDER)[keyof typeof SOCIAL_PROVIDER];
