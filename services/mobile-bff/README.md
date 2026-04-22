# service: mobile-bff

Backend-for-Frontend gateway for the React Native mobile client.

Responsibilities:
- JWT bearer token validation (Keycloak OIDC) on all inbound requests
- Request authorization — RBAC enforcement before forwarding to domain services
- Rate limiting for public-facing mobile endpoints
- Request shaping — aggregates responses from multiple domain services into
  mobile-optimized payloads (avoids N+1 round trips on the mobile client)
- Response envelope normalization — consistent error format (code, message, requestId)
- User identity, org, roles, and permissions injected into forwarded request context
- Auth state is managed here — domain services receive pre-validated context only

This BFF owns the client-facing API contract for the mobile app.
Domain services must not enforce auth independently of this gateway.
