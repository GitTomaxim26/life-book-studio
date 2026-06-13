# Life Book Studio — Data Model

*Source of truth: the live Supabase schema (verified via `information_schema`).
Section 1 is the **actual** current database. Section 2 is **future / not built**.
Do not rename Section-1 columns — the running app depends on these exact names.*

---

## 1. Current schema (live, RLS enabled on all tables)

### `books` — one row per user
| column | type | notes |
|---|---|---|
| `id` | uuid | primary key |
| `user_id` | uuid | owner; RLS keys off this |
| `title` | text | cover title |
| `subtitle` | text | cover subtitle |
| `quote` | text | cover epigraph/quote (NOT named "epigraph") |
| `theme` | text | `night` \| `paper` |
| `begun_at` | timestamptz | when the book was begun (colophon) |
| `focus_cycle` | integer | current focus cycle number |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `sections` — one row per writable prose chapter
| column | type | notes |
|---|---|---|
| `id` | uuid | primary key |
| `book_id` | uuid | → books.id |
| `slug` | text | chapter id; **unique per book** (NOT "section_key") |
| `kind` | text | e.g. `doc` |
| `content` | jsonb | TipTap document (NOT "content_json") |
| `structured` | jsonb | reserved for structured (non-prose) section data |
| `word_count` | integer | |
| `updated_at` | timestamptz | |

Slugs in use: `identity_now`, `key_exp`, `new_identity`, `future_to_avoid`, `vision`.
**Chapter titles, part labels, and order are NOT stored here** — they live in
`lib/structure.ts` (the IA is config, not user data). Do not duplicate them into the DB.

### `future_areas` — the 16 future areas (separate from sections)
| column | type | notes |
|---|---|---|
| `id` | uuid | primary key |
| `book_id` | uuid | → books.id |
| `slug` | text | area id (e.g. `f_health`) |
| `group_key` | text | one of the 6 future groups |
| `content` | jsonb | TipTap document |
| `word_count` | integer | |
| `updated_at` | timestamptz | |

> Note: Future areas are **not** in `sections`. They are their own table and need
> their own save path (sibling to `saveSection`).

### `cycles` — focus cycles (3 areas per 28-day cycle)
| column | type | notes |
|---|---|---|
| `id` | uuid | primary key |
| `book_id` | uuid | → books.id |
| `number` | integer | cycle number |
| `chosen_slugs` | array | the area slugs chosen for this cycle |
| `status` | text | cycle state |
| `started_at` | timestamptz | |
| `completed_at` | timestamptz | |

---

## 2. Future tables (NOT built — captured from design discussion)

*These do not exist yet. They are a feature of a Muse that does not exist yet.
Recorded so the design is preserved; build only when the Muse is built.*

### `muse_observations` — the Muse's readings (signals, threads, tensions…)
The home for the "first honest gesture" and everything that grows from it
(recurrences → patterns → threads). Holds what the **Muse proposes**, never what the
user authored.

Proposed shape:
| column | type | purpose |
|---|---|---|
| `id` | uuid | |
| `book_id` | uuid | |
| `type` | text | `recurrence` \| `absence` \| `tension` \| `echo` \| `contradiction` \| `shift` … |
| `summary` | text | the Muse's reading, stated openly (never a verdict) |
| `evidence` | jsonb | the concrete, provable basis (slugs + excerpts) — honesty rule |
| `accepted` | boolean | **the author ratifies the reading.** Default false. |
| `created_at` | timestamptz | |

**Why `accepted` matters (the charter in SQL):** a Muse observation is a *reading*,
not truth. It only becomes part of the book when the **author accepts it**. This is
"conclude never / the author keeps the pen" enforced by the schema itself.

### Critical boundary — keep author content and Muse readings in SEPARATE tables
- The **"Threads of My Story" chapter** the user *writes* belongs in `sections`
  (slug `threads`) like any other chapter — it is authored content.
- **Muse-proposed threads/patterns** belong in `muse_observations` — they are
  AI-proposed, user-accepted readings.
- These must never share a table. Different owner, different trust level. Mixing
  "what the user wrote" with "what the Muse noticed" would violate the authorship
  boundary the whole product protects.

### Possibly later (not now)
- A `status` field on `sections` (`draft` / `in_progress` / `done`) if explicit
  chapter status is ever needed. Today "chapters begun" derives from `word_count`,
  so this is not required yet.
