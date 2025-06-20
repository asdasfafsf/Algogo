import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestMetadata = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const metadata = request.metadata;
    return data ? metadata?.[data] : metadata;
  },
);
