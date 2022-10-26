import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';
import { ROLES_META } from 'src/consts';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles: string[] = this.reflector.get(ROLES_META, context.getHandler());

    if (!roles || roles.length == 0)
      return true;

    const user = context.switchToHttp().getRequest().user as User;

    if (!user)
      throw new UnauthorizedException()

    for (const role of user.roles) {
      if (roles.includes(role))
        return true;
    }

    return false;
  }
}
