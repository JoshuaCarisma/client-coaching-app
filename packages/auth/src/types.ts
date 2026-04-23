export {
  UserIdentitySchema,
  TokenClaimsSchema,
  RoleSchema,
} from "@bbc/schemas";

export type { UserIdentity, Role, TokenClaims } from "@bbc/schemas";

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: "Bearer";
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
