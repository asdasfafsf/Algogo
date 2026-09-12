import { ValidationPipe } from '@nestjs/common';
import { RequestExecuteDto } from './RequestExecuteDto';

describe('실행 요청 DTO 검증', () => {
  const pipe = new ValidationPipe({ transform: true, whitelist: true });

  it('유효한 실행 요청의 code와 inputList를 보존한다', async () => {
    const request = {
      provider: 'Python',
      code: 'print(42)',
      inputList: [{ seq: 1, input: '' }],
    };

    await expect(
      pipe.transform(request, {
        type: 'body',
        metatype: RequestExecuteDto,
      }),
    ).resolves.toEqual(request);
  });

  it('잘못된 입력 목록 항목을 거부한다', async () => {
    await expect(
      pipe.transform(
        {
          provider: 'Python',
          code: 'print(42)',
          inputList: [{ seq: '1', input: '' }],
        },
        { type: 'body', metatype: RequestExecuteDto },
      ),
    ).rejects.toThrow();
  });
});
