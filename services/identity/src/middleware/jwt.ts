import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { MiddlewareHandler } from 'hono';
import { TokenClaimsSchema, type TokenClaims } from '@bbc/schemas';

export type JwtVariables = {
  claims: TokenClaims;
};

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Required env var ${key} is not set`);
  return val;
}

const JWKS = createRemoteJWKSet(new URL(requireEnv('KEYCLOAK_JWKS_URL')));
const issuer = requireEnv('KEYCLOAK_ISSUER');

export const jwtMiddleware: MiddlewareHandler<{ Variables: JwtVariables }> = async (
  c,
  next,
) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = auth.slice(7);
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer,
      algorithms: ['RS256'],
    });
    const claims = TokenClaimsSchema.parse(payload);
    c.set('claims', claims);
    await next();
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
  }
};
