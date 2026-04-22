# service: calendar

The orchestration layer for cross-domain daily planning. Owns schedule objects,
daily plans, recurrence rules, and the coach-defined daily structure.

Responsibilities:

- Schedule object creation — links workouts, recipes, habits, and tasks into a client day
- Recurrence engine — daily, weekly, custom repeat patterns
- Cross-domain plan assembly — references Training and Nutrition definitions; does not own them
- Client calendar projection — optional outbound sync to EventKit (iOS) / Calendar Provider (Android)
- Emits `plan.scheduled` events consumed by Notifications and Analytics
- Coach task scheduling and client assignment

This service is the planning system of record. Training and Nutrition expose
definitions; Calendar sequences them into executable client days.
The device calendar is never the system of record — it is an optional output only.
