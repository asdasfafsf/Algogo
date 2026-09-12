import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import RequestUpdateCodeTemplateDto from './RequestUpdateCodeTemplateDto';

describe('템플릿 제목 길이 검증', () => {
  it.each(['정렬 템플릿', '가'.repeat(100), undefined])(
    '정상 제목 또는 생략을 허용한다',
    async (name) => {
      const dto = plainToInstance(RequestUpdateCodeTemplateDto, {
        uuid: 'template-id',
        language: 'Python',
        isDefault: false,
        name,
      });
      expect(await validate(dto)).toHaveLength(0);
    },
  );

  it.each(['가'.repeat(101), 100])(
    '너무 긴 제목과 숫자를 거부한다',
    async (name) => {
      const dto = plainToInstance(RequestUpdateCodeTemplateDto, {
        uuid: 'template-id',
        language: 'Python',
        isDefault: false,
        name,
      });
      expect(
        (await validate(dto)).some((error) => error.property === 'name'),
      ).toBe(true);
    },
  );
});
