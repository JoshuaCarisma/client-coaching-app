import type { MiddlewareHandler } from 'hono';
import type { JwtVariables } from './jwt.js';
import { type Role } from '@bbc/schemas';

const APP_ROLES: readonly Role[] = ['coach', 'client', 'admin'];

export type RolesVariables = JwtVariables & {
  roles: Role[];
};

export const rolesMiddleware: MiddlewareHandler<{ Variables: RolesVariables }> = async (
  c,
  next,
) => {
  const claims = c.get('claims');
  const appRoles = claims.realm_access.roles.filter((r): r is Role =>
    (APP_ROLES as readonly string[]).includes(r),
  );
  c.set('roles', appRoles);
  await next();
};

export const requireRole =
  (role: Role): MiddlewareHandler<{ Variables: RolesVariables }> =>
  async (c, next) => {
    const roles = c.get('roles');
    if (!roles.includes(role)) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    await next();
  };
