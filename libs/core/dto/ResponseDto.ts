import { HttpStatus } from '@nestjs/common';

export class ResponseDto<T> {
  private statusCode: HttpStatus;
  private errorCode: string;
  private errorMessage: string;
  private data: T;

  constructor(builder: ResponseDtoBuilder<T>) {
    this.statusCode = builder.statusCode;
    this.errorCode = builder.errorCode;
    this.errorMessage = builder.errorMessage;
    this.data = builder.data;
  }

  // Getters
  public getStatusCode(): HttpStatus {
    return this.statusCode;
  }

  public getErrorCode(): string {
    return this.errorCode;
  }

  public getErrorMessage(): string {
    return this.errorMessage;
  }

  public getData(): T {
    return this.data;
  }

  // Static Builder class
  public static get Builder() {
    return new ResponseDtoBuilder<any>();
  }
}

class ResponseDtoBuilder<T> {
  public statusCode: HttpStatus;
  public errorCode: string;
  public errorMessage: string;
  public data: T;

  public setStatusCode(statusCode: HttpStatus): ResponseDtoBuilder<T> {
    this.statusCode = statusCode;
    return this;
  }

  public setErrorCode(errorCode: string): ResponseDtoBuilder<T> {
    this.errorCode = errorCode;
    return this;
  }

  public setErrorMessage(errorMessage: string): ResponseDtoBuilder<T> {
    this.errorMessage = errorMessage;
    return this;
  }

  public setData(data: T): ResponseDtoBuilder<T> {
    this.data = data;
    return this;
  }

  public build(): ResponseDto<T> {
    return new ResponseDto<T>(this);
  }
}
