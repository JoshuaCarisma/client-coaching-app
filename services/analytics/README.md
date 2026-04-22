# service: analytics

Owns event ingestion, metric aggregation, and graph-ready analytics outputs for
client dashboards, coach adherence views, and admin business metrics.

Responsibilities:
- Domain event consumption — `workout.completed`, `recipe.adherence.logged`,
  `plan.scheduled`, and other timestamped events from domain services
- Metric aggregation — adherence rates, streak calculations, volume trends
- Client progress data — graph-ready series for the client analytics dashboard
- Coach view — adherence and risk signals per client
- Admin view — retention, engagement, and business metrics

Strict data separation:
- This service NEVER shares a pipeline or store with health metrics, journal content,
  body measurements, or biometric fields
- PostHog product events must never contain health or journal data fields
- Event payloads received here must be pre-sanitized by the emitting domain service
