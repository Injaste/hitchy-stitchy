-- Migration: bulk guest delete
-- =============================================================================
-- GuestsBulkBar gets a 4th action (Confirm / Pending / Cancel / Delete). Status
-- changes are a flag flip (immediate + undo, see the two prior migrations this
-- phase); delete is a genuine hard DELETE with no schema-backed reversal, and
-- at bulk scale can remove many guests' RSVP data in one shot — bigger blast
-- radius than the single small deletes left alone earlier this phase. Stays
-- confirm-gated, with a type-to-confirm phrase (destructive-actions.md) since
-- it's irreversible and content-bearing, just like the existing member/theme
-- deletes.
--
-- delete_guest (singular) is dropped, not kept alongside this — once this
-- checks existence the same way delete_guest did, it's a strict superset
-- (same permission check, same existence check, one id vs many), so keeping
-- both just means keeping two copies of the same logic in sync forever. Its
-- own body isn't in this repo (predates the migration history, like several
-- other guest RPCs), so this mirrors the 'guests' resource key every OTHER
-- guest RPC whose body IS in the repo uses (create_guest/update_guest_v2,
-- 20260617000006 and siblings) and the exists-or-raise pattern every other
-- delete RPC in this codebase uses (e.g. delete_task) — no silent partial
-- delete if a requested id doesn't resolve. Only caller of delete_guest was
-- src/pages/admin/guests/api.ts (grepped, confirmed); it now calls this RPC
-- with a one-element array for the single-guest case instead.
--
-- event_rsvps has no FK dependents (checked schema.sql) — a plain DELETE
-- needs no cascade handling.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.delete_guests(p_event_id uuid, p_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_caller      event_members;
  v_found_count int;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'guests', 'delete') THEN
    RAISE EXCEPTION 'Insufficient permission to delete guests';
  END IF;

  -- Every id must exist in THIS event, or the whole call fails — no silent
  -- partial delete (the confirm dialog's count would otherwise lie).
  SELECT count(*) INTO v_found_count
  FROM event_rsvps WHERE event_id = p_event_id AND id = ANY(p_ids);

  IF v_found_count <> COALESCE(array_length(p_ids, 1), 0) THEN
    RAISE EXCEPTION 'One or more guests could not be found';
  END IF;

  DELETE FROM event_rsvps WHERE event_id = p_event_id AND id = ANY(p_ids);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.delete_guests(uuid, uuid[]) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.delete_guests(uuid, uuid[]) TO authenticated;

DROP FUNCTION IF EXISTS public.delete_guest(uuid, uuid);

-- Rollback:
--   1) DROP FUNCTION public.delete_guests(uuid, uuid[]);
--   2) Re-create delete_guest — body not in this repo (predates migration
--      history); pull its definition from a pre-20260808 backup or
--      Supabase's function history if this is ever rolled back.
