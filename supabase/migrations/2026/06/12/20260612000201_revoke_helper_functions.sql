-- Revoke direct-call access to internal helper functions.
-- These are called only by other SECURITY DEFINER functions or the trigger system,
-- never directly by the client. is_event_member and is_super_admin_member are
-- intentionally excluded — they are referenced in RLS USING clauses and must
-- remain executable by the authenticated role.

REVOKE EXECUTE ON FUNCTION public.touch_updated_at()                                        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_event_active(uuid)                                     FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_current_member(uuid)                                  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_member_rank(event_members)                            FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(event_members)                             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_event_permission(uuid, text, text)                    FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_assignable_member(uuid, uuid)                          FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assert_added_assignees_assignable(uuid, uuid[], uuid[])   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_attach_table_triggers()                              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_slug_reservations()                       FROM PUBLIC, anon, authenticated;
