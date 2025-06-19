import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from './CustomHttpException';
import { CustomError } from '../types/error.type';

export class CustomNotFoundException extends CustomHttpException {
  constructor(error: CustomError) {
    super(error, HttpStatus.NOT_FOUND);
  }
}
