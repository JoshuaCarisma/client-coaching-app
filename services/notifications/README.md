# service: notifications

Owns reminder delivery, alert routing, and notification preferences via Novu.

Responsibilities:
- Workout reminders — triggered from `plan.scheduled` events
- Recipe and habit reminders
- Coach-initiated push alerts and announcements
- Notification preferences per client (opt-in/out per channel and type)
- Delivery channel routing — push (Expo), in-app, email (transactional only)
- Novu workflow configuration and template management

Notifications are downstream consumers of domain events — this service never
initiates business logic. It delivers what other services schedule.
No health data, journal content, or PII beyond user ID and delivery metadata
may appear in notification payloads.
