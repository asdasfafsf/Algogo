import * as Joi from 'joi';

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  CRAWLER_URL: Joi.string().required(),
  SERVER_PORT: Joi.string().required(),
  S3_SECRET_KEY: Joi.string().required(),
  S3_ACCESS_KEY: Joi.string().required(),
  S3_PROBLEM_BUCKET_NAME: Joi.string().required(),
  S3_REGION: Joi.string().required(),
  GOOGLE_OAUTH_CLIENT_ID: Joi.string().required(),
  GOOGLE_OAUTH_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_OAUTH_CALLBACK_URL: Joi.string().required(),
  GOOGLE_OAUTH_AUTHORIZATION_URL: Joi.string().required(),
  GOOGLE_OAUTH_TOKEN_URL: Joi.string().required(),
  KAKAO_OAUTH_CLIENT_ID: Joi.string().required(),
  KAKAO_OAUTH_CLIENT_SECRET: Joi.string().required(),
  KAKAO_OAUTH_CALLBACK_URL: Joi.string().required(),
  KAKAO_OAUTH_AUTHORIZATION_URL: Joi.string().required(),
  KAKAO_OAUTH_TOKEN_URL: Joi.string().required(),
});
