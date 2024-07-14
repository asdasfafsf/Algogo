import { Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import googleOAuthConfig from '../config/googleOAuthConfig';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(
  new PassportStrategy(),
  'google',
) {
  constructor(private oauthConfig: ConfigType<typeof googleOAuthConfig>) {
    super(oauthConfig);
  }
}
