/**
 * Keycloak Integration Tests
 *
 * Uses Resource Owner Password Credentials (ROPC) grant to obtain real JWTs
 * from the local Keycloak instance for schema validation and utility testing.
 *
 * ROPC is used ONLY in this test file for local integration testing.
 * The mobile app uses PKCE exclusively — see keycloakAuth.ts.
 * ROPC must NEVER be used in application code or production flows.
 *
 * Run with: pnpm --filter @bbc/service-identity test:integration
 * Requires: Keycloak running at localhost:8080 + KC_TEST_USER/KC_TEST_PASSWORD
 */

import { describe, it, expect } from "vitest";
import { TokenClaimsSchema } from "@bbc/schemas";
import {
  parseTokenExpiry,
  isTokenExpired,
  shouldRefresh,
  buildSession,
} from "@bbc/auth";

const KC_URL =
  process.env["EXPO_PUBLIC_KEYCLOAK_URL"] ?? "http://localhost:8080";
const KC_REALM = process.env["EXPO_PUBLIC_KEYCLOAK_REALM"] ?? "bbc";
const KC_USER = process.env["KC_TEST_USER"];
const KC_PASSWORD = process.env["KC_TEST_PASSWORD"];

const skipIfNoCredentials =
  !KC_USER || !KC_PASSWORD || process.env["INTEGRATION"] !== "true";

if (skipIfNoCredentials) {
  console.log(
    "Skipping integration test — set KC_TEST_USER, KC_TEST_PASSWORD in " +
      "infra/local/.env and run with INTEGRATION=true",
  );
}

describe("Keycloak token endpoint", () => {
  it.skipIf(skipIfNoCredentials)(
    "issues a valid token set via ROPC grant",
    async () => {
      const response = await fetch(
        `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "password",
            client_id: "mobile-bff",
            client_secret: "dev-mobile-bff-secret",
            username: KC_USER!,
            password: KC_PASSWORD!,
            scope: "openid profile email offline_access",
          }).toString(),
        },
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty("access_token");
      expect(body).toHaveProperty("refresh_token");
      expect(body).toHaveProperty("expires_in");
      (globalThis as Record<string, unknown>)["__testTokens"] = body;
    },
  );
});

describe("TokenClaimsSchema", () => {
  it.skipIf(skipIfNoCredentials)(
    "validates the Keycloak JWT payload against the Zod schema",
    () => {
      const { access_token } = (
        globalThis as Record<string, unknown>
      )["__testTokens"] as { access_token: string };
      expect(access_token).toBeDefined();

      const segments = access_token.split(".");
      const payload = JSON.parse(
        Buffer.from(
          segments[1]!.replace(/-/g, "+").replace(/_/g, "/"),
          "base64",
        ).toString("utf-8"),
      );

      const result = TokenClaimsSchema.safeParse(payload);
      if (!result.success) {
        console.error("Schema validation failed:", result.error.format());
      }
      expect(result.success).toBe(true);
    },
  );
});

describe("@bbc/auth token utilities", () => {
  it.skipIf(skipIfNoCredentials)(
    "parseTokenExpiry returns a future timestamp",
    () => {
      const { access_token } = (
        globalThis as Record<string, unknown>
      )["__testTokens"] as { access_token: string };
      const expiry = parseTokenExpiry(access_token);
      expect(typeof expiry).toBe("number");
      expect(expiry).toBeGreaterThan(Date.now());
    },
  );

  it.skipIf(skipIfNoCredentials)(
    "isTokenExpired returns false for a fresh token",
    () => {
      const { access_token } = (
        globalThis as Record<string, unknown>
      )["__testTokens"] as { access_token: string };
      const expiry = parseTokenExpiry(access_token);
      expect(isTokenExpired(expiry)).toBe(false);
    },
  );

  it.skipIf(skipIfNoCredentials)(
    "shouldRefresh returns false for a token with > 60s remaining",
    () => {
      const { access_token, refresh_token } = (
        globalThis as Record<string, unknown>
      )["__testTokens"] as { access_token: string; refresh_token: string };
      const session = buildSession(access_token, refresh_token);
      expect(shouldRefresh(session)).toBe(false);
    },
  );

  it.skipIf(skipIfNoCredentials)(
    "buildSession constructs a fully typed AuthSession",
    () => {
      const { access_token, refresh_token } = (
        globalThis as Record<string, unknown>
      )["__testTokens"] as { access_token: string; refresh_token: string };
      const session = buildSession(access_token, refresh_token);
      expect(session.accessToken).toBe(access_token);
      expect(session.refreshToken).toBe(refresh_token);
      expect(session.expiresAt).toBeGreaterThan(Date.now());
      expect(session.tokenType).toBe("Bearer");
    },
  );
});
