import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  errorCode: string;
  errorMessage: string;
  data: T;
}

/**
 * 응답 인터셉터
 * 응답 데이터를 처리하고 응답 형식을 정의합니다.
 * @param T 응답 데이터 타입
 * @returns 응답 데이터
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        errorCode: '0000',
        errorMessage: '',
        data,
      })),
    );
  }
}
