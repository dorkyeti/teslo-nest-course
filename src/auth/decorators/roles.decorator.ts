import { SetMetadata } from '@nestjs/common';
import { ROLES_META } from 'src/consts';
import { ValidRoles } from '../emuns/valid-roles.enums';

export const Roles = (...args: ValidRoles[]) => SetMetadata(ROLES_META, args);
