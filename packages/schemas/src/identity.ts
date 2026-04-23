import { z } from 'zod';

export const RoleSchema = z.enum(['coach', 'client', 'admin']);

export const UserIdentitySchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  roles: z.array(RoleSchema),
});

export const TokenClaimsSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  realm_access: z.object({
    roles: z.array(z.string()),
  }),
  iat: z.number().int(),
  exp: z.number().int(),
  iss: z.string().url(),
  aud: z.union([z.string(), z.array(z.string())]),
});

export type Role = z.infer<typeof RoleSchema>;
export type UserIdentity = z.infer<typeof UserIdentitySchema>;
export type TokenClaims = z.infer<typeof TokenClaimsSchema>;
