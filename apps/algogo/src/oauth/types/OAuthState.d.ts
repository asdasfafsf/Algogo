import { OAuthState } from '../constants/OAuthState';

type OAuthStateType = (typeof OAuthState)[keyof typeof OAuthState];
