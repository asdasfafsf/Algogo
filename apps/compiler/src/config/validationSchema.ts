import * as Joi from 'joi';

export const validationSchema = Joi.object({
  TMP_DIR: Joi.string().required(),
  SERVER_PORT: Joi.number().required(),
  BULLMQ_PORT: Joi.number().required(),
  BULLMQ_HOST: Joi.string().required(),
  // BULLMQ_PASSWORD: Joi.string().required(),
  BULLMQ_QUEUE_NAME: Joi.string().required(),
});
