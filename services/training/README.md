# service: training

Owns the exercise library, workout definitions, programs, session execution, and logging.

Responsibilities:

- Exercise catalog (seeded from wger — product logic is custom-owned, not wger-coupled)
- Workout and program builder — sets, reps, rest, RPE, supersets, circuits
- Program phases and progression logic
- Timed workout engine configuration (cues, intervals, rest timers)
- Session logging — completed sets, weights, RPE scores, timer outcomes
- Progress photo metadata (asset stored in Supabase Storage via ingestion boundary)
- Delivery modes: 1:1, group, hybrid, at-home variants
- Emits `workout.completed` events consumed by Analytics

Training exposes definitions. Calendar references and schedules them.
Training never schedules itself.
