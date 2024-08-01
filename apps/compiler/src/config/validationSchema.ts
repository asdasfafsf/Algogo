import * as Joi from 'joi';

export const validationSchema = Joi.object({
  TMP_DIR: Joi.string().required(),
  SERVER_PORT: Joi.number().required(),
});
