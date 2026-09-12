import { EventEmitter } from 'node:events';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import type { ClsService } from 'nestjs-cls';
import type { AppLogger } from '../logger/app-logger';
import { RequestLogInterceptor } from './request-log.interceptor';

describe('RequestLogInterceptor', () => {
  it('응답 완료 시 최종 상태와 query 없는 경로를 한 번 기록한다', () => {
    const log = jest.fn();
    const logger = { log } as unknown as AppLogger;
    const cls = {
      get: jest.fn((key: string) => `${key}-value`),
    } as unknown as ClsService;
    const response = Object.assign(new EventEmitter(), { statusCode: 200 });
    const request = {
      method: 'GET',
      path: '/oauth/callback',
      originalUrl: '/oauth/callback?token=secret',
      headers: { 'user-agent': 'jest' },
      ip: '127.0.0.1',
    };
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;
    const next = { handle: () => of(undefined) } as CallHandler;

    new RequestLogInterceptor(logger, cls).intercept(context, next).subscribe();
    response.statusCode = 500;
    response.emit('finish');
    response.emit('close');

    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(
      'access',
      expect.objectContaining({
        status: 500,
        path: '/oauth/callback',
        requestId: 'requestId-value',
        traceId: 'traceId-value',
      }),
    );
    expect(JSON.stringify(log.mock.calls)).not.toContain('secret');
  });
});
