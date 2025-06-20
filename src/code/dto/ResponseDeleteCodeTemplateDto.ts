import { ApiProperty } from '@nestjs/swagger';

/**
 * Code Template 삭제 응답 DTO
 */
export class ResponseDeleteCodeTemplateDto {
  @ApiProperty({
    description: '삭제된 코드 템플릿의 UUID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  uuid: string;
}
