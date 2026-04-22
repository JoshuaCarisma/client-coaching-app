# service: messaging

Owns message threads, room management, and presence via Matrix Synapse.

Responsibilities:

- Direct coach–client messaging rooms
- Group and cohort channels
- Community and challenge threads
- Media sharing within message threads (routes through ingestion boundary)
- Announcement channels (coach → client)
- Presence and read-receipt state
- Matrix Synapse homeserver integration — room creation, membership, federation config

Matrix Synapse is the required homeserver. Dendrite must not be used in production.
Messaging exists within the coach–client relationship — not as a standalone social product.
