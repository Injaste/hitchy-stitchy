-- Migration: per-event push subscriptions + per-member notification preferences
--
-- WHY:
--   1. push_subscriptions was UNIQUE on `endpoint` alone, so a device could hold
--      exactly one row. Entering a second event overwrote the first event's row
--      (onConflict: "endpoint"), making it impossible to be subscribed to more
--      than one event on the same device. We move the uniqueness to
--      (endpoint, event_id) so a device keeps one row per event it has entered.
--   2. Notification feature preferences (which kinds of notifications a member
--      wants — today just "timeline") live in event_members.preferences->'notifications'.
--      Default-on by absence: a feature is enabled unless explicitly set to false.
--      update_notification_preferences lets a member edit ONLY their own row.

-- 1. Swap the endpoint-only uniqueness for (endpoint, event_id) ------------------
--    The original unique constraint/index name is not recorded in schema.sql
--    (the table was reverse-inferred), so discover and drop whatever unique
--    constraint covers `endpoint` alone, then add the composite one.
DO $$
DECLARE
  v_conname text;
BEGIN
  SELECT c.conname INTO v_conname
  FROM pg_constraint c
  WHERE c.conrelid = 'public.push_subscriptions'::regclass
    AND c.contype = 'u'
    AND (
      SELECT array_agg(a.attname::text ORDER BY a.attname)
      FROM pg_attribute a
      WHERE a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
    ) = ARRAY['endpoint'];

  IF v_conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.push_subscriptions DROP CONSTRAINT %I', v_conname);
  END IF;
END $$;

-- Cover the case where uniqueness was a bare unique INDEX (not a constraint).
DO $$
DECLARE
  v_idx text;
BEGIN
  SELECT i.indexrelid::regclass::text INTO v_idx
  FROM pg_index i
  JOIN pg_class t ON t.oid = i.indrelid
  WHERE t.relname = 'push_subscriptions'
    AND i.indisunique
    AND NOT i.indisprimary
    AND NOT EXISTS (SELECT 1 FROM pg_constraint c WHERE c.conindid = i.indexrelid)
    AND (
      SELECT array_agg(a.attname::text ORDER BY a.attname)
      FROM pg_attribute a
      WHERE a.attrelid = i.indrelid AND a.attnum = ANY (i.indkey)
    ) = ARRAY['endpoint'];

  IF v_idx IS NOT NULL THEN
    EXECUTE format('DROP INDEX %s', v_idx);
  END IF;
END $$;

ALTER TABLE public.push_subscriptions
  ADD CONSTRAINT push_subscriptions_endpoint_event_key UNIQUE (endpoint, event_id);

-- 2. Member edits their OWN notification preferences ----------------------------
--    SECURITY DEFINER + get_current_member() scopes the write to the caller's row.
--    Merges into preferences->'notifications' so other preference keys and other
--    feature flags are preserved; the client sends only the keys it is toggling.
CREATE OR REPLACE FUNCTION public.update_notification_preferences(
  p_event_id      uuid,
  p_notifications jsonb
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_prefs  jsonb;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  UPDATE event_members
  SET preferences = jsonb_set(
        COALESCE(preferences, '{}'::jsonb),
        '{notifications}',
        COALESCE(preferences -> 'notifications', '{}'::jsonb) || p_notifications,
        true
      )
  WHERE id = v_caller.id
  RETURNING preferences INTO v_prefs;

  RETURN v_prefs;
END;
$$;

-- Rollback:
--   DROP FUNCTION IF EXISTS public.update_notification_preferences(uuid, jsonb);
--   ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_endpoint_event_key;
--   ALTER TABLE public.push_subscriptions ADD CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint);
