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
  ENCRYPT_KEY: Joi.string().required(),
  ENCRYPT_IV: Joi.string().required(),
  ENCRYPT_TAG: Joi.string().required(),
  PREV_ENCRYPT_KEY: Joi.string().required(),
  PREV_ENCRYPT_IV: Joi.string().required(),
  PREV_ENCRYPT_TAG: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  PREV_JWT_SECRET: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  // REDIS_PASSWORD: Joi.string().required(),
});
