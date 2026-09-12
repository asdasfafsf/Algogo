import { ValidationPipe } from '@nestjs/common';
import { InquiryTodayProblemsDto } from './inquiry-today-problems.dto';

describe('오늘의 문제 날짜 쿼리 검증', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    transformOptions: { enableImplicitConversion: true },
  });
  const metadata = {
    type: 'query' as const,
    metatype: InquiryTodayProblemsDto,
  };

  it.each([
    ['0', 0],
    ['-30', -30],
  ])('%s를 숫자 %d로 변환한다', async (value, expected) => {
    const result = await pipe.transform({ day: value }, metadata);

    expect(result.day).toBe(expected);
  });

  it('숫자가 아닌 값에는 숫자 검증 메시지만 반환한다', async () => {
    await expect(
      pipe.transform({ day: 'abc' }, metadata),
    ).rejects.toMatchObject({
      response: {
        message: ['날짜는 숫자만 입력할 수 있습니다.'],
      },
    });
  });

  it.each([
    ['-31', '30일 전까지만 조회 가능합니다.'],
    ['1', '과거 날짜만 조회 가능합니다.'],
  ])('%s에는 범위에 맞는 검증 메시지를 반환한다', async (value, message) => {
    await expect(
      pipe.transform({ day: value }, metadata),
    ).rejects.toMatchObject({
      response: { message: [message] },
    });
  });
});
