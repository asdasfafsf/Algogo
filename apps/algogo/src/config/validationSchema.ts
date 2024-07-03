import * as Joi from 'joi';

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  CRAWLER_URL: Joi.string().required(),
  SERVER_PORT: Joi.string().required(),
  S3_SECRET_KEY: Joi.string().required(),
  S3_ACCESS_KEY: Joi.string().required(),
  S3_PROBLEM_BUCKET_NAME: Joi.string().required(),
  S3_REGION: Joi.string().required(),
});
