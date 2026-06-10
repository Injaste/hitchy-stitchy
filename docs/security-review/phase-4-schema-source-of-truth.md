# Phase 4 — Restore schema.sql as source of truth (medium, needs live DB)

**Effort:** medium — no app-code risk (documentation/schema snapshot only),
but requires pulling function bodies from the **live Supabase database**.
**Impact:** high — CLAUDE.md declares `supabase/schema.sql` + migrations the
source of truth, and today the snapshot is wrong about the single most
security-relevant function in the system.

## 1. Stale function bodies in schema.sql (actively misleading)
Migration `20260605000001_collapse_access_three_level.sql` redefined two core
access functions; `supabase/schema.sql` still shows the **pre-migration**
versions:

| Function | schema.sql (stale) | Live version (migration `20260605000001`) |
|---|---|---|
| `has_event_permission` | `schema.sql:839-860` — reads `permissions -> resource ->> action` (object-shaped) | lines 25-49 — flat string levels: `read` satisfied by `read|full`, writes require `full` |
| `get_member_rank` | `schema.sql:820-827` — couple-identity rank only | lines 59-70 — capability rank (superadmin / members:full / rest) |

The stale `has_event_permission` body would return `false` for every
non-superadmin against the seeded `{"tasks":"full"}` shape — anyone reasoning
from (or copying) the snapshot gets the permission model wrong.
**Fix:** paste the migration versions over the stale bodies in `schema.sql`.
This needs no DB access — the migration file has the truth.

## 2. RPCs called by the frontend but absent from the repo entirely
The known-undumped list at `schema.sql:940-948` covers most write RPCs by
name. Two functions are **not even named** anywhere in `supabase/`:

- `get_user_events` — called at `src/pages/dashboard/api.ts:8`; powers the
  entire dashboard event list.
- `get_rsvp` — called at `src/pages/wedding/api.ts:44`; the public RSVP
  lookup (takes a guest id + token — its validation logic is security-relevant
  and currently unreviewable).

**Fix:** dump both bodies from the live DB (Dashboard → Database → Functions,
or `pg_get_functiondef`) and add them to `schema.sql` — at minimum to the
named list, ideally full bodies given `get_rsvp` is part of the public
token-auth surface.

## 3. Verify `update_invitation`'s config merge behavior
`src/pages/admin/invitation/config/components/ConfigsView.tsx:48-57` submits a
`config` object containing **only** `rsvp.fields.message`. If the live
`update_invitation` does `config = p_config` (replace) rather than a deep
merge (`config || p_config` or jsonb_set), every save of that form deletes any
other key `config` ever gains. Unverifiable from the repo today — that's this
phase's point. While dumping bodies (item 2), check this one and either:
- confirm it merges → add a comment in ConfigsView saying so, or
- it replaces → fix server-side (merge in the RPC) or send the full config
  from the client, and record the decision.

## 4. Process guard so this doesn't regress
The drift happened because migrations are paste-run against the live DB and
`schema.sql` is hand-synced. Cheap guard: add a line to the migration README
(or CLAUDE.md backend section) — "a migration that `CREATE OR REPLACE`s a
function MUST be accompanied by the same body replacing the old one in
schema.sql" — and do a one-time diff pass: for each
`CREATE OR REPLACE FUNCTION` in `supabase/migrations/`, confirm `schema.sql`
holds the latest version (the review found `has_event_permission` +
`get_member_rank`; re-check the rest mechanically while at it).

## Verification
- `grep -n "->> p_action" supabase/schema.sql` → no hits (stale body gone).
- Every `supabase.rpc("...")` name in `src/` appears in `supabase/` (re-run
  the review's extraction: `grep -rhoE 'rpc\(\s*"[a-z_]+"' src | sort -u`).
- No app code changes → no build/behavior risk; review the schema.sql diff
  against the live `pg_get_functiondef` output before committing.
