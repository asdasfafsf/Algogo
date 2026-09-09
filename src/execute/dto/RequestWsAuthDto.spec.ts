import { ValidationPipe } from '@nestjs/common';
import { RequestWsAuthDto } from './RequestWsAuthDto';

describe('WebSocket auth DTO under the global whitelist pipe', () => {
  const pipe = new ValidationPipe({ transform: true, whitelist: true });
  const metadata = { type: 'body' as const, metatype: RequestWsAuthDto };

  it('retains the token and strips unknown fields', async () => {
    const result = await pipe.transform(
      { token: 'signed-token', extra: true },
      metadata,
    );
    expect(result).toEqual({ token: 'signed-token' });
  });

  it.each([{}, { token: '' }, { token: 123 }])(
    'rejects invalid auth data %j',
    async (body) => {
      await expect(pipe.transform(body, metadata)).rejects.toThrow();
    },
  );
});
