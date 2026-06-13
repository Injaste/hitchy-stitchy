-- 20260612000201_revoke_helper_functions.sql revoked has_event_permission from
-- authenticated, but the event_rsvps_select RLS policy calls it directly in its
-- USING clause. RLS policies run as the querying role, so authenticated must have
-- EXECUTE. The function returns only a boolean, so granting it is safe.
GRANT EXECUTE ON FUNCTION public.has_event_permission(uuid, text, text) TO authenticated;

-- Rollback:
--   REVOKE EXECUTE ON FUNCTION public.has_event_permission(uuid, text, text) FROM authenticated;
