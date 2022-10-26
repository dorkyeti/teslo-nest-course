import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ValidRoles } from '../emuns/valid-roles.enums';
import { UserRoleGuard } from '../guards/user-role.guard';
import { Roles } from './';

export function Auth(...roles: ValidRoles[]) {
    return applyDecorators(
        Roles(...roles),
        UseGuards(AuthGuard(), UserRoleGuard)
    );
}