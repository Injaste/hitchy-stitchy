-- Migration: template scoping — event-private templates + get_templates RPC
-- =============================================================================
-- 1. event_id (nullable FK → events): NULL = global catalog row visible to all
--    authenticated members. Non-null = private — only members of that event can
--    see or select it in the picker.
-- 2. Drop the open SELECT policy. With RLS still enabled, direct table queries
--    return nothing. get_templates is the sole authoritative read path.
-- 3. get_templates(p_event_id) SECURITY DEFINER RPC — replaces the client's
--    direct table SELECT. Returns global templates + private templates scoped
--    to the given event, for active members only.
-- =============================================================================

ALTER TABLE public.event_templates
  ADD COLUMN event_id uuid REFERENCES public.events(id) ON DELETE SET NULL;

-- Drop the open SELECT policy. RLS remains enabled — direct table reads now
-- return zero rows. All reads go through get_templates.
DROP POLICY event_templates_select ON public.event_templates;

-- get_templates — sole authoritative picker read.
-- SECURITY DEFINER bypasses RLS; membership check + event scoping done here.
CREATE OR REPLACE FUNCTION public.get_templates(p_event_id uuid)
RETURNS SETOF public.event_templates
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE v_caller event_members;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller IS NULL THEN RETURN; END IF;

  RETURN QUERY
    SELECT * FROM public.event_templates
    WHERE is_active = true
      AND (event_id IS NULL OR event_id = p_event_id)
    ORDER BY name ASC;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_templates(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_templates(uuid) TO authenticated;

-- Rollback:
--   DROP FUNCTION public.get_templates(uuid);
--   CREATE POLICY event_templates_select ON public.event_templates
--     FOR SELECT TO authenticated USING (is_active = true);
--   ALTER TABLE public.event_templates DROP COLUMN event_id;
