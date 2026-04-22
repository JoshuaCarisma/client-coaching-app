# service: identity

Owns users, roles, organizations, consent records, permissions, and session context.

Responsibilities:
- Keycloak OIDC integration — token issuance, refresh, introspection
- User profile creation and management (coach, client, admin roles)
- Organization membership and multi-coach tenancy
- Consent records — explicit sync consent before health data access
- Role-based permission definitions consumed by the API gateway
- Audit log of auth and permission events

This service is the source of truth for identity. No other service manages auth state.
Auth validation at the API gateway uses tokens issued here; domain services receive
pre-validated user context in request headers — they do not re-validate tokens.
