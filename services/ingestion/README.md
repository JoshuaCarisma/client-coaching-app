# service: ingestion

Owns the media upload pipeline, transcription, and AI orchestration for journal entries
and coaching media. This service produces inputs — it does not make decisions.

Responsibilities:
- Resumable media upload to Supabase Storage (journal audio/video, progress photos,
  meal photos) — the only service boundary permitted to call Supabase Storage directly
- faster-whisper transcription jobs — voice journal → transcript text
- Haystack orchestration — RAG pipeline, journal intelligence, summary generation
- vLLM inference calls — summaries, topic tags, sentiment classification
- Transcription and summary result delivery to Journaling service
- Background job queue management for async media processing

AI outputs from this service are assistive only:
- Summaries and tags are inputs for coaches and dashboards
- No AI output is presented to clients as a clinical recommendation
- Human coaching review is required before any health-risk-adjacent output is surfaced
- This service never autonomously triggers health-critical actions
