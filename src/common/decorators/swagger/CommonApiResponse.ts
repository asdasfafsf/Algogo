import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponseDto } from '../../dto/ResponseDto';
interface CommonApiResponseOptions<T extends Type<any>> {
  status?: number;
  description?: string;
  model: T;
  isArray?: boolean;
}

export const CommonApiResponse = <T extends Type<any>>(
  opts: CommonApiResponseOptions<T>,
) =>
  applyDecorators(
    ApiExtraModels(ResponseDto, opts.model),
    ApiResponse({
      status: opts.status ?? 200,
      description: opts.description ?? '',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties: {
              data: opts.isArray
                ? { type: 'array', items: { $ref: getSchemaPath(opts.model) } }
                : { $ref: getSchemaPath(opts.model) },
            },
          },
        ],
      },
    }),
  );
