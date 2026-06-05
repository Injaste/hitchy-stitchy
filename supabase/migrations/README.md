# Supabase migrations

The database (tables, RLS policies, RPC functions) lives in the Supabase project — there is no Supabase CLI wired up. We still **version every backend change here** so the schema has a history.

## Workflow
1. Each change is a timestamped SQL file: `YYYYMMDDHHMMSS_short_description.sql`.
2. Open the [Supabase SQL editor](https://supabase.com/dashboard) for this project and **paste-run the file's contents**.
3. Files are written to be idempotent where practical (`CREATE OR REPLACE FUNCTION`, `DROP POLICY IF EXISTS` before `CREATE POLICY`).
4. Each file ends with a `-- Rollback:` comment showing how to revert.

## Conventions
- One logical change per file.
- For policy/function changes, include the prior definition in the rollback comment so it can be restored quickly.
- Functions are `SECURITY DEFINER` and enforce membership via `get_current_member()` / permissions via `has_event_permission()` — keep that pattern.
