import { ValidationPipe } from '@nestjs/common';
import { InquiryProblemsSummaryDto } from './inquiry-problems-summary.dto';

describe('Problem sort query conversion', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    transformOptions: { enableImplicitConversion: true },
  });
  const metadata = {
    type: 'query' as const,
    metatype: InquiryProblemsSummaryDto,
  };

  it('converts a string enum value without inferred decorator metadata', async () => {
    const result = await pipe.transform({ sort: '10' }, metadata);
    expect(result.sort).toBe(10);
  });

  it('rejects an unsupported sort value', async () => {
    await expect(pipe.transform({ sort: '999' }, metadata)).rejects.toThrow();
  });
});
