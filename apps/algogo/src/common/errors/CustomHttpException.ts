import { HttpException } from "@nestjs/common";

export default class CustomHttpException extends HttpException {
  constructor(customError: CustomError, status: number) {
    super(customError, status);
  }
}