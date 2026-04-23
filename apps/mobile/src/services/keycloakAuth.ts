import * as ExpAuth from "expo-auth-session";
import { buildSession } from "@bbc/auth";
import type { AuthSession } from "@bbc/auth";

const KEYCLOAK_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL;
const KEYCLOAK_REALM = process.env.EXPO_PUBLIC_KEYCLOAK_REALM;
const KEYCLOAK_CLIENT_ID = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID;

if (!KEYCLOAK_URL || !KEYCLOAK_REALM || !KEYCLOAK_CLIENT_ID) {
  throw new Error(
    "Missing required Keycloak environment variables. " +
      "Check EXPO_PUBLIC_KEYCLOAK_URL, EXPO_PUBLIC_KEYCLOAK_REALM, " +
      "EXPO_PUBLIC_KEYCLOAK_CLIENT_ID in your .env.local file.",
  );
}

const ISSUER_URL = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;
const TOKEN_ENDPOINT = `${ISSUER_URL}/protocol/openid-connect/token`;

let cachedDiscovery: ExpAuth.DiscoveryDocument | null = null;

export async function getDiscovery(): Promise<ExpAuth.DiscoveryDocument> {
  if (cachedDiscovery) return cachedDiscovery;
  cachedDiscovery = await ExpAuth.fetchDiscoveryAsync(ISSUER_URL);
  return cachedDiscovery;
}

export function getRedirectUri(): string {
  return ExpAuth.makeRedirectUri({
    scheme: "com.bodybycarisma.mobile",
    path: "auth/callback",
  });
}

export async function buildAuthRequest(): Promise<ExpAuth.AuthRequest> {
  return new ExpAuth.AuthRequest({
    clientId: KEYCLOAK_CLIENT_ID,
    scopes: ["openid", "profile", "email", "offline_access"],
    redirectUri: getRedirectUri(),
    usePKCE: true,
    // DO NOT set prompt: "login" here — forces reauthentication on every login
    // Omitting allows Keycloak to reuse active browser sessions
  });
}

export async function exchangeCodeForSession(
  request: ExpAuth.AuthRequest,
  response: ExpAuth.AuthSessionResult,
): Promise<AuthSession> {
  if (response.type !== "success") {
    throw new Error(
      `Auth flow did not complete: type was "${response.type}". ` +
        "User may have cancelled or the session timed out.",
    );
  }

  const discovery = await getDiscovery();

  const tokenResponse = await ExpAuth.exchangeCodeAsync(
    {
      clientId: KEYCLOAK_CLIENT_ID,
      code: response.params.code,
      redirectUri: getRedirectUri(),
      extraParams: {
        code_verifier: request.codeVerifier ?? "",
      },
    },
    discovery,
  );

  if (!tokenResponse.accessToken || !tokenResponse.refreshToken) {
    throw new Error(
      "Token exchange succeeded but response is missing access or refresh token. " +
        "Confirm offline_access scope is enabled and bbc-realm.json is correct.",
    );
  }

  return buildSession(tokenResponse.accessToken, tokenResponse.refreshToken);
}

export async function refreshTokens(refreshToken: string): Promise<AuthSession> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: KEYCLOAK_CLIENT_ID,
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Token refresh failed: HTTP ${response.status}. ` +
        `Keycloak response: ${body}. ` +
        "Refresh token may be expired — user must re-login.",
    );
  }

  const data = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
  };

  if (!data.access_token || !data.refresh_token) {
    throw new Error(
      "Refresh response missing access_token or refresh_token. " +
        "Check Keycloak client configuration.",
    );
  }

  return buildSession(data.access_token, data.refresh_token);
}
