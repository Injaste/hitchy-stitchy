-- event_tutorial — per-event onboarding/setup-guide state. Super-admin-only (the
-- couple), one row per event. Most checklist COMPLETION is DERIVED on the client
-- from real data (guests/pages/timeline/…), which is event-wide — so the guide
-- itself is event-scoped, not per-member. Two things can't be derived and are
-- persisted here: dismissed (the guide is hidden) and viewed_steps (steps that
-- complete on being SEEN, not by a data artifact — e.g. the read-only Access page).
-- A plain boolean (not a *_at) — nothing reads the moment of dismissal; server-driven
-- updated_at already records when the row last changed for support/debugging.
-- Lazy — not seeded by create_event; a missing row means "not dismissed, nothing
-- viewed". Direct writes under RLS (no RPC) — same super-admin gate the budget/gifts
-- tables use for reads (is_super_admin_member).

CREATE TABLE IF NOT EXISTS public.event_tutorial (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id     uuid        NOT NULL,
  dismissed    boolean     NOT NULL DEFAULT false,
  viewed_steps jsonb       NOT NULL DEFAULT '[]'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_tutorial_pkey PRIMARY KEY (id),
  CONSTRAINT event_tutorial_event_key UNIQUE (event_id),
  CONSTRAINT event_tutorial_event_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE
);

ALTER TABLE public.event_tutorial ENABLE ROW LEVEL SECURITY;

-- Couple-only (is_super_admin_member). Same predicate across select/insert/update,
-- so either partner can read & write the shared event row. Mirrors the super-admin
-- gate on the budget/gifts tables.
DROP POLICY IF EXISTS event_tutorial_select ON public.event_tutorial;
CREATE POLICY event_tutorial_select ON public.event_tutorial
  FOR SELECT TO authenticated
  USING (is_super_admin_member(event_id));

DROP POLICY IF EXISTS event_tutorial_insert ON public.event_tutorial;
CREATE POLICY event_tutorial_insert ON public.event_tutorial
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin_member(event_id));

DROP POLICY IF EXISTS event_tutorial_update ON public.event_tutorial;
CREATE POLICY event_tutorial_update ON public.event_tutorial
  FOR UPDATE TO authenticated
  USING (is_super_admin_member(event_id))
  WITH CHECK (is_super_admin_member(event_id));

DROP TRIGGER IF EXISTS touch_updated_at_event_tutorial ON public.event_tutorial;
CREATE TRIGGER touch_updated_at_event_tutorial
  BEFORE UPDATE ON public.event_tutorial
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Rollback:
--   DROP TABLE IF EXISTS public.event_tutorial;  -- cascades its policies + trigger
