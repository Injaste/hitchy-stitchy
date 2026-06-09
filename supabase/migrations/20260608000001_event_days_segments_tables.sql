-- Migration: event_days + event_segments spine — 1/3 TABLES  (Phase 0, Stage 1)
-- =============================================================================
-- Run in order:
--   1. 20260608000001_event_days_segments_tables.sql    (this file)
--   2. 20260608000002_event_days_segments_backfill.sql  (one-time data)
--   3. 20260608000003_event_days_segments_rpcs.sql      (create_event + segment CRUD)
--
-- Additive and trigger-free. event_timelines.day is KEPT; segment_id is added
-- alongside it (seeding/seamlessness explained in file 3). Reconciling days when
-- an event's date range is EDITED is deferred — see docs/LAUNCH-TODO.md
-- (Events & Days). There is no event-edit path yet.
--
-- NOTE: touch_updated_at triggers attach automatically to the two new tables via
-- the existing auto_attach_triggers_on_create event trigger — do not add them.
-- =============================================================================


-- =============================================================================
-- 1) Tables
-- =============================================================================
CREATE TABLE public.event_days (
  id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id   uuid        NOT NULL,
  date       date        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_days_pkey              PRIMARY KEY (id),
  CONSTRAINT event_days_event_id_date_key UNIQUE (event_id, date),
  CONSTRAINT event_days_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE
);

CREATE INDEX event_days_event_id_idx ON public.event_days (event_id);

CREATE TABLE public.event_segments (
  id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id   uuid        NOT NULL,   -- denormalised for RLS (mirrors sibling tables)
  day_id     uuid        NOT NULL,
  name       text,                   -- NULL = the default segment for the day
  sort_order integer     NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_segments_pkey PRIMARY KEY (id),
  CONSTRAINT event_segments_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id)     ON DELETE CASCADE,
  CONSTRAINT event_segments_day_id_fk
    FOREIGN KEY (day_id)   REFERENCES public.event_days (id) ON DELETE CASCADE
);

CREATE INDEX event_segments_event_id_idx ON public.event_segments (event_id);
CREATE INDEX event_segments_day_id_idx   ON public.event_segments (day_id);

-- At most one default (NULL-name) segment per day.
CREATE UNIQUE INDEX event_segments_one_default_per_day
  ON public.event_segments (day_id) WHERE name IS NULL;


-- =============================================================================
-- 2) RLS — members of the event can read; mutations go through RPCs only
-- =============================================================================
ALTER TABLE public.event_days     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_days_select ON public.event_days
  FOR SELECT TO authenticated
  USING (is_event_member(event_id));

CREATE POLICY event_segments_select ON public.event_segments
  FOR SELECT TO authenticated
  USING (is_event_member(event_id));


-- =============================================================================
-- 3) event_timelines.segment_id (additive — `day` is kept)
-- =============================================================================
ALTER TABLE public.event_timelines
  ADD COLUMN segment_id uuid;

ALTER TABLE public.event_timelines
  ADD CONSTRAINT event_timelines_segment_id_fk
    FOREIGN KEY (segment_id) REFERENCES public.event_segments (id) ON DELETE CASCADE;

CREATE INDEX event_timelines_segment_id_idx
  ON public.event_timelines (segment_id);
