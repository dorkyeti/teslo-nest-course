import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const GetUser = createParamDecorator<string>(function (data: string, ctx: ExecutionContext) {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user)
        throw new InternalServerErrorException('User not found (Request)');

    return data ? user[data] : user;
});