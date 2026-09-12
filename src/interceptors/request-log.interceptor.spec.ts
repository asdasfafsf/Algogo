import { EventEmitter } from 'node:events';
import {
  BadRequestException,
  Controller,
  Get,
  type CallHandler,
  type ExecutionContext,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { ClsModule, type ClsService } from 'nestjs-cls';
import request from 'supertest';
import { AppLogger } from '../logger/app-logger';
import { RequestLogInterceptor } from './request-log.interceptor';

@Controller()
class RequestLogTestController {
  @Get('failure')
  fail(): never {
    throw new BadRequestException('failure');
  }
}

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

  it('실제 HTTP 응답이 끝날 때 CLS 문맥과 오류 상태를 유지한다', async () => {
    const log = jest.fn();
    const module = await Test.createTestingModule({
      imports: [
        ClsModule.forRoot({
          global: true,
          middleware: {
            mount: true,
            setup: (cls) => {
              cls.set('requestId', 'request-http');
              cls.set('traceId', 'trace-http');
            },
          },
        }),
      ],
      controllers: [RequestLogTestController],
      providers: [
        RequestLogInterceptor,
        { provide: AppLogger, useValue: { log } },
      ],
    }).compile();
    const app = module.createNestApplication();
    app.useGlobalInterceptors(app.get(RequestLogInterceptor));
    await app.init();

    await request(app.getHttpServer())
      .get('/failure?access_token=secret')
      .expect(400);
    await new Promise<void>((resolve) => setImmediate(resolve));
    await app.close();

    expect(log).toHaveBeenCalledWith(
      'access',
      expect.objectContaining({
        status: 400,
        path: '/failure',
        requestId: 'request-http',
        traceId: 'trace-http',
      }),
    );
    expect(JSON.stringify(log.mock.calls)).not.toContain('secret');
  });
});
