# Supabase migrations

The database (tables, RLS policies, RPC functions) lives in the Supabase project — there is no Supabase CLI wired up. We still **version every backend change here** so the schema has a history.

## Layout
Migration files are grouped into nested folders by date: `<YYYY>/<MM>/<DD>/`. So `20260612000001_delete_day_guard_items.sql` lives at `2026/06/12/20260612000001_delete_day_guard_items.sql`. The full date prefix stays in the filename — the folders mirror it so a year/month/day is easy to scan. This `README.md` stays at the migrations root. Paste-run order is still the lexical order of the filenames (which equals chronological order across folders).

## Workflow
1. Each change is a sequenced SQL file: `YYYYMMDD` + a 6-digit number + `_short_description.sql` (see **Numbering**), filed under `<YYYY>/<MM>/<DD>/`.
2. Open the [Supabase SQL editor](https://supabase.com/dashboard) for this project and **paste-run the file's contents**.
3. Files are written to be idempotent where practical (`CREATE OR REPLACE FUNCTION`, `DROP POLICY IF EXISTS` before `CREATE POLICY`).
4. Each file ends with a `-- Rollback:` comment showing how to revert.

## Production safety — never mutate a shared/public RPC in place
**There is live production data.** The Supabase project is shared between dev and prod, and migrations are paste-run straight against it, while the **deployed** frontend keeps calling the existing functions. So the DB and the live frontend must stay compatible at **every** migration.

**Rule:** never `CREATE OR REPLACE`, change the signature of, repoint, or `DROP` a function the deployed frontend or the public page already calls — e.g. `get_public_invitation`, `submit_rsvp`, `update_rsvp`, `get_rsvp`, `cancel_rsvp`, `create_guests`, `update_guest`, `update_guests`, `delete_guest`, `update_invitation`/`create_theme`/`update_theme`.

**Instead, add a `_v2` (additive):** to give one new behavior, create a NEW function named `<original>_v2` (e.g. `get_public_invitation_v2`, `submit_rsvp_v2`, `create_guests_v2`) and point **only the not-yet-deployed new frontend** at it. The original stays **byte-for-byte untouched** until the go-live cleanup migration drops it (after the new frontend has shipped). New tables/columns may be added (additive); just don't rewrite the live read/write functions.

This is the expand→contract strategy: **expand** (add `_v2` + new schema) now, **contract** (drop old) only at go-live. Repointing a shared function in place is what caused a live RSVP-page outage on 2026-06-17.

## Numbering
The 6 digits after the date are **not** a wall-clock time — they're a per-day sequence split into **feature lanes of 100**, so one feature can span several files (initial + fixups) without renumbering, and two features built the same day never collide.

- The first feature worked on a given day starts at `000001`.
- Each new feature starts a fresh hundreds block: `000101`, `000201`, `000301`, …
- Within one feature, increment by one: `000101`, `000102`, `000103`, …

So on a single day, feature 1 is `…000001`+ and feature 2 is `…000101`+ — e.g. `20260610000001_budget_tracker.sql` then `20260610000101_member_invite_link.sql`. That leaves ~99 files of headroom per feature. (The legacy double-booked `20260605000004_*` pair predates this rule.)

## Conventions
- One logical change per file.
- **Never mutate a shared/public RPC in place — add a `_v2` instead** (see *Production safety* above). The deployed frontend must keep working after every migration.
- **Every `CREATE OR REPLACE FUNCTION` carries a short comment directly above it:** for an *edit*, what changed and why; for a *new* function, its purpose; for a `DROP`, why it's being removed. So a function's diff is self-explaining without cross-referencing the live dump.
- For policy/function changes, include the prior definition in the rollback comment so it can be restored quickly.
- Functions are `SECURITY DEFINER` and enforce membership via `get_current_member()` / permissions via `has_event_permission()` — keep that pattern.
