# Supabase migrations

The database (tables, RLS policies, RPC functions) lives in the Supabase project — there is no Supabase CLI wired up. We still **version every backend change here** so the schema has a history.

## Workflow
1. Each change is a sequenced SQL file: `YYYYMMDD` + a 6-digit number + `_short_description.sql` (see **Numbering**).
2. Open the [Supabase SQL editor](https://supabase.com/dashboard) for this project and **paste-run the file's contents**.
3. Files are written to be idempotent where practical (`CREATE OR REPLACE FUNCTION`, `DROP POLICY IF EXISTS` before `CREATE POLICY`).
4. Each file ends with a `-- Rollback:` comment showing how to revert.

## Numbering
The 6 digits after the date are **not** a wall-clock time — they're a per-day sequence split into **feature lanes of 100**, so one feature can span several files (initial + fixups) without renumbering, and two features built the same day never collide.

- The first feature worked on a given day starts at `000001`.
- Each new feature starts a fresh hundreds block: `000101`, `000201`, `000301`, …
- Within one feature, increment by one: `000101`, `000102`, `000103`, …

So on a single day, feature 1 is `…000001`+ and feature 2 is `…000101`+ — e.g. `20260610000001_budget_tracker.sql` then `20260610000101_member_invite_link.sql`. That leaves ~99 files of headroom per feature. (The legacy double-booked `20260605000004_*` pair predates this rule.)

## Conventions
- One logical change per file.
- **Every `CREATE OR REPLACE FUNCTION` carries a short comment directly above it:** for an *edit*, what changed and why; for a *new* function, its purpose; for a `DROP`, why it's being removed. So a function's diff is self-explaining without cross-referencing the live dump.
- For policy/function changes, include the prior definition in the rollback comment so it can be restored quickly.
- Functions are `SECURITY DEFINER` and enforce membership via `get_current_member()` / permissions via `has_event_permission()` — keep that pattern.
