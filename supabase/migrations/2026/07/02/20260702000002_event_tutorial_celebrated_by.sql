-- event_tutorial: track the completion CELEBRATION per member, so the confetti
-- fires exactly once per person — never again once they've seen it, even across
-- sessions or if the guide re-completes (delete then re-add an item). Mirrors
-- dismissed_by: a jsonb array of event_members.id that have already celebrated.
-- The "all done" VISUAL (ring turns success, header) still shows every time; only
-- the one-shot confetti is gated on this. Additive, defaults to empty.

ALTER TABLE public.event_tutorial
  ADD COLUMN IF NOT EXISTS celebrated_by jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Rollback:
--   ALTER TABLE public.event_tutorial DROP COLUMN IF EXISTS celebrated_by;
