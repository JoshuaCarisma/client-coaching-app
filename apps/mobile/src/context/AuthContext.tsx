import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import type { AuthSession, AuthStatus, UserIdentity } from "@bbc/auth";
import {
  isTokenExpired,
  shouldRefresh,
  UserIdentitySchema,
  RoleSchema,
} from "@bbc/auth";
import {
  saveSession,
  loadSession,
  clearSession,
} from "../services/tokenStorage";
import {
  getDiscovery,
  buildAuthRequest,
  exchangeCodeForSession,
  refreshTokens,
} from "../services/keycloakAuth";

interface AuthState {
  status: AuthStatus;
  session: AuthSession | null;
  user: UserIdentity | null;
  error: string | null;
}

const initialState: AuthState = {
  status: "loading",
  session: null,
  user: null,
  error: null,
};

type AuthAction =
  | { type: "RESTORE_SESSION"; session: AuthSession; user: UserIdentity }
  | { type: "LOGIN_SUCCESS"; session: AuthSession; user: UserIdentity }
  | { type: "LOGOUT" }
  | { type: "REFRESH_SUCCESS"; session: AuthSession }
  | { type: "AUTH_ERROR"; error: string }
  | { type: "CLEAR_ERROR" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "RESTORE_SESSION":
      return {
        status: "authenticated",
        session: action.session,
        user: action.user,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        status: "authenticated",
        session: action.session,
        user: action.user,
        error: null,
      };
    case "LOGOUT":
      return {
        status: "unauthenticated",
        session: null,
        user: null,
        error: null,
      };
    case "REFRESH_SUCCESS":
      return {
        ...state,
        status: "authenticated",
        session: action.session,
      };
    case "AUTH_ERROR":
      return {
        status: "unauthenticated",
        session: null,
        user: null,
        error: action.error,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
  }
}

function parseUserFromToken(accessToken: string): UserIdentity {
  const parts = accessToken.split(".");
  const segment = parts[1];
  if (!segment) {
    throw new Error("Token missing required identity claims");
  }

  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padding =
    base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));

  let payload: unknown;
  try {
    payload = JSON.parse(atob(base64 + padding));
  } catch {
    throw new Error("Token missing required identity claims");
  }

  const raw = payload as Record<string, unknown>;

  if (!raw["sub"] || typeof raw["sub"] !== "string") {
    throw new Error("Token missing required identity claims");
  }
  if (!raw["email"] || typeof raw["email"] !== "string") {
    throw new Error("Token missing required identity claims");
  }

  const realmRoles =
    (raw["realm_access"] as Record<string, unknown> | undefined)?.["roles"];
  const rawRoles = Array.isArray(realmRoles) ? (realmRoles as string[]) : [];

  const validRoleValues = RoleSchema.options;
  const roles = rawRoles.filter(
    (r): r is (typeof validRoleValues)[number] =>
      validRoleValues.includes(r as (typeof validRoleValues)[number]),
  );

  const result = UserIdentitySchema.safeParse({
    sub: raw["sub"],
    email: raw["email"],
    roles,
  });

  if (!result.success) {
    throw new Error("Invalid UserIdentity from token");
  }

  return result.data;
}

interface AuthContextValue {
  state: AuthState;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const stored = await loadSession();

        if (!stored) {
          if (!cancelled) dispatch({ type: "LOGOUT" });
          return;
        }

        if (isTokenExpired(stored.expiresAt)) {
          await clearSession();
          if (!cancelled) dispatch({ type: "LOGOUT" });
          return;
        }

        if (shouldRefresh(stored)) {
          await refresh();
          return;
        }

        const user = parseUserFromToken(stored.accessToken);
        if (!cancelled) {
          dispatch({ type: "RESTORE_SESSION", session: stored, user });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Session restore failed";
        if (!cancelled) {
          dispatch({ type: "AUTH_ERROR", error: message });
          setTimeout(() => {
            if (!cancelled) dispatch({ type: "LOGOUT" });
          }, 100);
        }
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async () => {
    try {
      const discovery = await getDiscovery();
      const request = await buildAuthRequest();
      const result = await request.promptAsync(discovery);
      const session = await exchangeCodeForSession(request, result);
      const user = parseUserFromToken(session.accessToken);
      await saveSession(session);
      dispatch({ type: "LOGIN_SUCCESS", session, user });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      dispatch({ type: "AUTH_ERROR", error: message });
    }
  };

  const logout = async () => {
    await clearSession();
    dispatch({ type: "LOGOUT" });
    // NOTE: Keycloak end_session endpoint (SSO logout) is not called here.
    // This clears local tokens only. Full SSO logout is a future task.
  };

  const refresh = async () => {
    const currentSession = stateRef.current.session;
    if (!currentSession?.refreshToken) {
      dispatch({ type: "LOGOUT" });
      return;
    }
    try {
      const newSession = await refreshTokens(currentSession.refreshToken);
      await saveSession(newSession);
      dispatch({ type: "REFRESH_SUCCESS", session: newSession });
    } catch {
      await clearSession();
      dispatch({ type: "LOGOUT" });
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout, refresh, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth must be called inside an AuthProvider. " +
        "Wrap your root layout in <AuthProvider>.",
    );
  }
  return context;
}

export { AuthContext };
