import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Wp_Users } from './user/wp_users.entity';

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): Wp_Users => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
