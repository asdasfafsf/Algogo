import { EXTERNAL_PROVIDER } from '../constants/external.constant';

export type ExternalProvider =
  (typeof EXTERNAL_PROVIDER)[keyof typeof EXTERNAL_PROVIDER];
