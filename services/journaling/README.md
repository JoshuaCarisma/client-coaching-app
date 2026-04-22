# service: journaling

Owns journal entries, media metadata, transcripts, AI summaries, tags, and the
client timeline. Journaling is a first-class data input — not a notes field.

Responsibilities:

- Canonical journal record — text, audio, and video entry types
- Asset metadata — links to Supabase Storage objects uploaded via ingestion service
- Transcript attachment — receives completed transcripts from ingestion pipeline
- AI summary and tag attachment — receives outputs from Haystack/vLLM pipeline
- Timeline event creation and ordering
- Coach review mode — surfaces entries and summaries to the assigned coach
- Mood and sentiment overlay storage (never logged, never in analytics pipeline)
- Entry search and tagging

Journal entries must never appear in logs, error messages, or PostHog event payloads.
Sentiment and mood data are strictly private — coach-visible only with explicit consent.
AI summaries are assistive inputs for coaches — never presented as clinical output.
