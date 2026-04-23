import * as SecureStore from "expo-secure-store";
import type { AuthSession } from "@bbc/auth";

const BBC_ACCESS_TOKEN = "bbc.session.access_token";
const BBC_REFRESH_TOKEN = "bbc.session.refresh_token";
const BBC_EXPIRES_AT = "bbc.session.expires_at";
const BBC_TOKEN_TYPE = "bbc.session.token_type";
const BBC_CONSENT_GIVEN = "bbc.consent.given";

export async function saveSession(session: AuthSession): Promise<void> {
  try {
    await SecureStore.setItemAsync(BBC_ACCESS_TOKEN, session.accessToken);
    await SecureStore.setItemAsync(BBC_REFRESH_TOKEN, session.refreshToken);
    await SecureStore.setItemAsync(BBC_EXPIRES_AT, String(session.expiresAt));
    await SecureStore.setItemAsync(BBC_TOKEN_TYPE, session.tokenType);
  } catch (err) {
    await clearSession();
    throw err;
  }
}

export async function loadSession(): Promise<AuthSession | null> {
  try {
    const accessToken = await SecureStore.getItemAsync(BBC_ACCESS_TOKEN);
    const refreshToken = await SecureStore.getItemAsync(BBC_REFRESH_TOKEN);
    const expiresAtRaw = await SecureStore.getItemAsync(BBC_EXPIRES_AT);
    const tokenType = await SecureStore.getItemAsync(BBC_TOKEN_TYPE);

    if (!accessToken || !refreshToken || !expiresAtRaw || !tokenType) {
      return null;
    }

    const expiresAt = parseInt(expiresAtRaw, 10);
    if (!Number.isFinite(expiresAt)) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      expiresAt,
      tokenType: "Bearer",
    };
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const results = await Promise.allSettled([
    SecureStore.deleteItemAsync(BBC_ACCESS_TOKEN),
    SecureStore.deleteItemAsync(BBC_REFRESH_TOKEN),
    SecureStore.deleteItemAsync(BBC_EXPIRES_AT),
    SecureStore.deleteItemAsync(BBC_TOKEN_TYPE),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("tokenStorage: clearSession partial failure", result.reason);
    }
  }
}

export async function getConsentGiven(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(BBC_CONSENT_GIVEN);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setConsentGiven(): Promise<void> {
  await SecureStore.setItemAsync(BBC_CONSENT_GIVEN, "true");
}
