-- Migration: event_invitations — the merged, parallel invitation table.
-- =============================================================================
-- Step 1 of the invitation redesign (docs/todo/invitation/redesign.md). ONE new
-- table that is the home of an invitation: its template + design content AND its
-- own RSVP config. Built ENTIRELY IN PARALLEL — the old event_invitation
-- (singular), event_themes, the _rsvp RPCs, and create_event's auto-upsert all
-- keep running untouched, so there is NO live risk. They are dropped only at the
-- go-live cleanup.
--
-- template_key = the code-registry key (NOT the event slug — slug is the event's
-- alone now). day_id / segment_id are added now (nullable, UNUSED in Step 1) so
-- per-day pages in Step 3 need no ALTER: UNIQUE NULLS NOT DISTINCT makes the all-
-- NULL (event, -, -) row collide -> one invitation per event today, one per
-- (event, day[, segment]) once day_id is populated. RLS: members read; writes go
-- through SECURITY DEFINER RPCs (later) — no write policy. touch_updated_at
-- auto-attaches via auto_attach_triggers_on_create.
-- =============================================================================

CREATE TABLE public.event_invitations (
  id            uuid          NOT NULL DEFAULT gen_random_uuid(),
  event_id      uuid          NOT NULL,
  day_id        uuid,                                      -- unused in Step 1; per-day in Step 3
  segment_id    uuid,                                      -- unused in Step 1; segment split later

  -- template + design
  template_key  text,                                      -- code-registry key (not the event slug)
  name          text          NOT NULL DEFAULT 'My Invitation',
  theme_config  jsonb         NOT NULL DEFAULT '{}',
  published_at  timestamptz,

  -- RSVP config (the invitation owns its own settings)
  event_date           date,
  event_time_start     text,
  event_time_end       text,
  rsvp_mode            event_rsvp_mode NOT NULL DEFAULT 'public',
  rsvp_deadline        timestamptz,
  max_guests           integer,
  guest_count_min      integer         NOT NULL DEFAULT 1,
  guest_count_max      integer         NOT NULL DEFAULT 10,
  confirmation_message text            NOT NULL DEFAULT 'We look forward to celebrating with you!',
  config               jsonb           NOT NULL DEFAULT '{"rsvp": {"fields": {"message": {"visible": false, "required": false}}}}',

  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT event_invitations_pkey PRIMARY KEY (id),
  -- All-NULL day/segment collide under NULLS NOT DISTINCT -> one per event now,
  -- one per (event, day[, segment]) once day_id is populated in Step 3.
  CONSTRAINT event_invitations_event_day_segment_key
    UNIQUE NULLS NOT DISTINCT (event_id, day_id, segment_id),
  CONSTRAINT event_invitations_event_id_fk
    FOREIGN KEY (event_id)   REFERENCES public.events (id)         ON DELETE CASCADE,
  CONSTRAINT event_invitations_day_id_fk
    FOREIGN KEY (day_id)     REFERENCES public.event_days (id)     ON DELETE CASCADE,
  CONSTRAINT event_invitations_segment_id_fk
    FOREIGN KEY (segment_id) REFERENCES public.event_segments (id) ON DELETE CASCADE
);

ALTER TABLE public.event_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_invitations_select ON public.event_invitations
  FOR SELECT TO authenticated
  USING (is_event_member(event_id));

-- Rollback:
--   DROP TABLE public.event_invitations;
