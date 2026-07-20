-- Migration: drop the stale RPC overloads left by adding params
-- =============================================================================
-- `CREATE OR REPLACE FUNCTION` only replaces a function with the SAME signature.
-- Adding a parameter therefore created an OVERLOAD — the old-arity function is
-- still in the database, and because the new param has a DEFAULT, both candidates
-- match a call that omits it. Postgres refuses to choose:
--
--   "Could not choose the best candidate function between:
--      public.create_vendor(... p_notes => text),
--      public.create_vendor(... p_notes => text, p_day_ids => uuid[])"
--
-- So this is a live correctness bug, not tidiness: ANY caller on the old arity
-- errors out. Today's frontend always sends the new params, so it resolves
-- uniquely — but a cached bundle mid-deploy, a script, or future code would not.
--
-- Dropping the old signature IMPROVES compatibility rather than breaking it:
-- afterwards a call that omits the new param matches the one remaining function
-- and the param simply defaults to NULL. Nothing in the app needs to change.
--
-- Signatures below are taken verbatim from the ambiguity errors, so each DROP
-- targets exactly the old function and cannot hit the new one.
--
-- Going forward: change a signature with DROP + CREATE in the same migration
-- (as 20260612000101 did for update_expense), not CREATE OR REPLACE + new param.
-- =============================================================================

-- Vendors — old arity lacked p_day_ids [superseded by 20260718000010/11].
DROP FUNCTION IF EXISTS public.create_vendor(uuid, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.update_vendor(uuid, uuid, text, text, text, text, text);

-- Expenses — old arity lacked p_vendor_id [superseded by 20260718000014/15].
DROP FUNCTION IF EXISTS public.create_expense(uuid, text, text, text, numeric, numeric, date, text, uuid);
DROP FUNCTION IF EXISTS public.update_expense(uuid, uuid, text, text, text, numeric, numeric, date, text, uuid);

-- Verify (expect exactly one row per name):
--   SELECT p.proname, pg_get_function_identity_arguments(p.oid)
--   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE n.nspname = 'public'
--     AND p.proname IN ('create_vendor','update_vendor','create_expense','update_expense')
--   ORDER BY p.proname;

-- Rollback: re-create the old signatures from 20260718000005/006 (vendors) and
-- 20260630000102 / 20260612000101 (expenses) — though re-introducing them would
-- restore the ambiguity, so this should not be rolled back in isolation.
