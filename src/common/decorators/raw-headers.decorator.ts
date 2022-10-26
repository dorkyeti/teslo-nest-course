import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RawHeaders = createParamDecorator(function (_, ctx: ExecutionContext): string[] {
    const request = ctx.switchToHttp().getRequest();

    return request.rawHeaders;
});