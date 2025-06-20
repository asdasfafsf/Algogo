import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const OAuth = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const oauth = request.oauth;
    return data ? oauth?.[data] : oauth;
  },
);
