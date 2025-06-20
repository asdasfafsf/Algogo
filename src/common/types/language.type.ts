import { LANGUAGE_PROVIDER } from '../constants/language.constant';

export type LanguageProvider =
  (typeof LANGUAGE_PROVIDER)[keyof typeof LANGUAGE_PROVIDER];
