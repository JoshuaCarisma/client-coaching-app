import { z } from "zod";
import type { AuthSession } from "./types.js";

const JwtPayloadSchema = z.object({
  exp: z.number().int().positive(),
});

export function parseTokenExpiry(accessToken: string): number {
  const parts = accessToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const segment = parts[1];
  if (!segment) {
    throw new Error("Invalid JWT format");
  }

  let decoded: string;
  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padding = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
    decoded = atob(base64 + padding);
  } catch {
    throw new Error("Invalid JWT format");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(decoded);
  } catch {
    throw new Error("Invalid JWT format");
  }

  const result = JwtPayloadSchema.safeParse(payload);
  if (!result.success) {
    throw new Error("JWT payload missing exp claim");
  }

  return result.data.exp * 1000;
}

export function isTokenExpired(expiresAt: number): boolean {
  if (!Number.isFinite(expiresAt) || expiresAt <= 0) {
    throw new Error("expiresAt must be a finite positive number");
  }
  return Date.now() >= expiresAt;
}

export function shouldRefresh(session: AuthSession): boolean {
  return isTokenExpired(session.expiresAt - 60_000);
}

export function buildSession(
  accessToken: string,
  refreshToken: string
): AuthSession {
  if (!accessToken) {
    throw new Error("accessToken must be a non-empty string");
  }
  if (!refreshToken) {
    throw new Error("refreshToken must be a non-empty string");
  }
  const expiresAt = parseTokenExpiry(accessToken);
  return { accessToken, refreshToken, expiresAt, tokenType: "Bearer" };
}
