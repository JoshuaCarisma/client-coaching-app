# service: coach-bff

Backend-for-Frontend gateway for the coach web dashboard.

Responsibilities:

- JWT bearer token validation (Keycloak OIDC) on all inbound requests
- Authorization enforcement — coach and admin role gating
- Rate limiting for coach-facing endpoints
- Request aggregation — composes client roster data, program state, journal review
  queues, and adherence views into coach-dashboard-optimized payloads
- Response envelope normalization — consistent error format (code, message, requestId)
- User identity, org, roles, and permissions injected into forwarded request context
- Credential-gated feature access — full meal planning and prescription-level features
  require verified coach credentials enforced at this boundary

This BFF owns the API contract for coach-web and admin-web.
Domain services must not enforce auth independently of this gateway.
