-- =============================================================================
-- Hitchy Stitchy — Supabase schema baseline
-- Generated: 2026-06-04
--
-- This is a POINT-IN-TIME REFERENCE SNAPSHOT of the database state before
-- versioned migrations began (supabase/migrations/). It is NOT a runnable
-- migration — Supabase auth schema, system tables, and extension internals are
-- excluded. Use this as a human/AI reference and a disaster-recovery guide.
--
-- Confidence markers used throughout:
--   [confirmed]  — column/constraint/index data extracted from live DB queries
--   [inferred]   — reconstructed from RPC function bodies (high confidence)
--   [partial]    — column list was truncated; some columns may be missing
--
-- ⚠️  CURRENT STATE = THIS BASELINE + the migrations in supabase/migrations/.
-- This file is NOT re-folded after each migration. Applied since the baseline:
--   20260604000001_bootstrap_lockout_signals      — get_bootstrap_context emits
--       MEMBER_REMOVED / MEMBER_SUSPENDED lockout signals.
--   20260604000002_tighten_access_groups_select   — event_access_groups SELECT
--       → is_event_member (active members read group rows).
--   20260605000001_collapse_access_three_level     — fixed Admin/Team groups;
--       has_event_permission → none/read/full; get_member_rank → capability rank;
--       create_event seeds Admin+Team; drop the access-group editor RPCs;
--       event_resources collapsed to a bare catalog; tables vendors/announcements/
--       live_logs removed from the model.
--   20260605000002_drop_unimplemented_features      — DROP event_vendors,
--       event_announcements, event_announcement_reads, event_live_logs.
--   20260605000003_team_perms_and_guest_rls         — Team loses guests/invitation/
--       themes; event_rsvps SELECT gated by has_event_permission(guests, read).
--   20260605000004_member_email_protection          — roster read only via the
--       get_members RPC (fields tiered by role); event_members SELECT → own row
--       only (user_id = auth.uid()), keeping self-realtime without exposing others.
-- =============================================================================


-- =============================================================================
-- EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"    VERSION '1.3';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"   VERSION '1.1';
CREATE EXTENSION IF NOT EXISTS "pg_net"      VERSION '0.20.0';
CREATE EXTENSION IF NOT EXISTS "plpgsql"     VERSION '1.0';
-- pg_stat_statements and supabase_vault are managed by Supabase platform.


-- =============================================================================
-- ENUM TYPES  [confirmed]
-- =============================================================================

CREATE TYPE public.event_rsvp_mode   AS ENUM ('public', 'private', 'both');
CREATE TYPE public.event_rsvp_source AS ENUM ('public', 'private');
CREATE TYPE public.event_rsvp_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE public.event_task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.event_task_status   AS ENUM ('todo', 'in_progress', 'done');


-- =============================================================================
-- TABLES  (dependency order; events.created_by FK deferred to bottom)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- events  [inferred from create_event, get_bootstrap_context, delete_event RPCs]
-- Note: created_by FK added after event_members to break the circular dep.
-- -----------------------------------------------------------------------------
CREATE TABLE public.events (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  slug         text        NOT NULL,
  name         text        NOT NULL,
  date_start   date        NOT NULL,
  date_end     date        NOT NULL,
  created_by   uuid,                  -- FK → event_members.id added below
  deleted_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT events_pkey        PRIMARY KEY (id),
  CONSTRAINT events_slug_key    UNIQUE (slug)
);

-- -----------------------------------------------------------------------------
-- event_access_groups  [confirmed]
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_access_groups (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id    uuid        NOT NULL,
  name        text        NOT NULL,
  permissions jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_roles_pkey              PRIMARY KEY (id),
  CONSTRAINT event_roles_event_id_name_key UNIQUE (event_id, name),
  CONSTRAINT event_access_groups_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- event_members  [confirmed]
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_members (
  id              uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id        uuid        NOT NULL,
  user_id         uuid,                -- auth.users.id; nullable until invite claimed
  access_group_id uuid        NOT NULL,
  email           text        NOT NULL,
  display_name    text        NOT NULL,
  invited_at      timestamptz NOT NULL DEFAULT now(),
  joined_at       timestamptz,
  rejected_at     timestamptz,
  frozen_at       timestamptz,
  invited_by      uuid,                -- FK → event_members.id (self-ref)
  is_root         boolean     NOT NULL DEFAULT false,
  is_bride        boolean     NOT NULL DEFAULT false,
  is_groom        boolean     NOT NULL DEFAULT false,
  role            text,
  notes           text,
  preferences     jsonb                DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_members_pkey PRIMARY KEY (id),

  CONSTRAINT event_members_event_id_fk
    FOREIGN KEY (event_id)        REFERENCES public.events (id)              ON DELETE CASCADE,
  CONSTRAINT event_members_access_group_fk
    FOREIGN KEY (access_group_id) REFERENCES public.event_access_groups (id) ON DELETE SET NULL,
  CONSTRAINT event_members_invited_by_fk
    FOREIGN KEY (invited_by)      REFERENCES public.event_members (id)       ON DELETE SET NULL
);

-- Partial indexes enforcing one bride / one groom / one root per event  [confirmed]
CREATE UNIQUE INDEX one_bride_per_event  ON public.event_members (event_id) WHERE is_bride = true;
CREATE UNIQUE INDEX one_groom_per_event  ON public.event_members (event_id) WHERE is_groom = true;
CREATE UNIQUE INDEX one_root_per_event   ON public.event_members (event_id) WHERE is_root  = true;

-- Circular FK: events.created_by → event_members  [confirmed via FK dump]
ALTER TABLE public.events
  ADD CONSTRAINT events_created_by_fk
    FOREIGN KEY (created_by) REFERENCES public.event_members (id) ON DELETE NO ACTION;

-- -----------------------------------------------------------------------------
-- event_templates  [confirmed constraints; columns inferred from create_theme RPC]
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_templates (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  slug        text        NOT NULL,
  description text,
  config      jsonb       NOT NULL DEFAULT '{}',
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_themes_pkey      PRIMARY KEY (id),
  CONSTRAINT event_themes_slug_key  UNIQUE (slug)
);

-- -----------------------------------------------------------------------------
-- event_themes  [inferred from create_theme, update_theme, publish_theme RPCs + FK dump]
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_themes (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id     uuid        NOT NULL,
  template_id  uuid,
  name         text        NOT NULL DEFAULT 'My Invitation',
  config       jsonb       NOT NULL DEFAULT '{}',
  published_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_themes_id_pkey PRIMARY KEY (id),

  CONSTRAINT event_themes_event_id_fk
    FOREIGN KEY (event_id)    REFERENCES public.events (id)          ON DELETE CASCADE,
  CONSTRAINT event_themes_template_id_fk
    FOREIGN KEY (template_id) REFERENCES public.event_templates (id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- event_invitation  [confirmed]
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_invitation (
  id                   uuid               NOT NULL DEFAULT gen_random_uuid(),
  event_id             uuid               NOT NULL,
  event_date           date,
  event_time_start     text,
  event_time_end       text,
  rsvp_mode            event_rsvp_mode    NOT NULL DEFAULT 'public',
  rsvp_deadline        timestamptz,
  max_guests           integer,
  guest_count_min      integer            NOT NULL DEFAULT 1,
  guest_count_max      integer            NOT NULL DEFAULT 10,
  confirmation_message text               NOT NULL DEFAULT 'We look forward to celebrating with you!',
  config               jsonb              NOT NULL DEFAULT '{"rsvp": {"fields": {"message": {"visible": false, "required": false}}}}',
  created_at           timestamptz        NOT NULL DEFAULT now(),
  updated_at           timestamptz        NOT NULL DEFAULT now(),

  CONSTRAINT event_invitation_pkey         PRIMARY KEY (id),
  CONSTRAINT event_invitation_event_id_key UNIQUE (event_id),

  CONSTRAINT event_invitation_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- event_settings  [confirmed]
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_settings (
  id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id   uuid        NOT NULL,
  task_order jsonb       NOT NULL DEFAULT '{"done": [], "todo": [], "in_progress": []}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_settings_pkey         PRIMARY KEY (id),
  CONSTRAINT event_settings_event_id_key UNIQUE (event_id),

  CONSTRAINT event_settings_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- event_rsvps  [confirmed]
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_rsvps (
  id           uuid              NOT NULL DEFAULT gen_random_uuid(),
  event_id     uuid              NOT NULL,
  name         text              NOT NULL,
  phone        text              NOT NULL,
  guest_count  integer           NOT NULL DEFAULT 1,
  message      text,
  status       event_rsvp_status NOT NULL DEFAULT 'confirmed',
  source       event_rsvp_source NOT NULL DEFAULT 'public',
  token        uuid              NOT NULL DEFAULT gen_random_uuid(),
  invite_code  text,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at   timestamptz       NOT NULL DEFAULT now(),
  updated_at   timestamptz       NOT NULL DEFAULT now(),

  CONSTRAINT event_rsvps_pkey                PRIMARY KEY (id),
  CONSTRAINT event_rsvps_event_id_phone_key  UNIQUE (event_id, phone),

  CONSTRAINT event_rsvps_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- event_tasks  [confirmed pos 1-7; remaining columns inferred from RPCs]
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_tasks (
  id           uuid                NOT NULL DEFAULT gen_random_uuid(),
  event_id     uuid                NOT NULL,
  created_by   uuid,                        -- FK → event_members.id (NO ACTION on delete)
  title        text                NOT NULL,
  details      text,
  status       event_task_status   NOT NULL DEFAULT 'todo',
  priority     event_task_priority,
  assignees    uuid[]              NOT NULL DEFAULT '{}',
  label        text,
  due_at       date,
  completed_at timestamptz,
  archived_at  timestamptz,
  created_at   timestamptz         NOT NULL DEFAULT now(),
  updated_at   timestamptz         NOT NULL DEFAULT now(),

  CONSTRAINT event_tasks_pkey PRIMARY KEY (id),

  CONSTRAINT event_tasks_event_id_fk
    FOREIGN KEY (event_id)   REFERENCES public.events (id)         ON DELETE CASCADE,
  CONSTRAINT event_tasks_created_by_fk
    FOREIGN KEY (created_by) REFERENCES public.event_members (id)  ON DELETE NO ACTION
);

-- -----------------------------------------------------------------------------
-- event_timelines  [inferred from create_timeline, start_timeline, end_timeline RPCs + FK + indexes]
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_timelines (
  id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id   uuid        NOT NULL,
  day        date        NOT NULL,     -- kept during the day→segment transition (migration 20260608000001); dropped in Stage 2
  segment_id uuid,                     -- → event_segments.id (FK added below); set by timeline RPCs in Stage 2, backfilled from `day` for now
  label      text,
  time_start time        NOT NULL,
  time_end   time,
  title      text        NOT NULL,
  details    text,
  assignees  uuid[]      NOT NULL DEFAULT '{}',
  started_at timestamptz,
  ended_at   timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_timelines_pkey PRIMARY KEY (id),

  CONSTRAINT event_timelines_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE
);

-- Only one active (started but not ended) timeline item per event  [confirmed]
CREATE UNIQUE INDEX one_active_timeline_per_event
  ON public.event_timelines (event_id)
  WHERE started_at IS NOT NULL AND ended_at IS NULL;

-- -----------------------------------------------------------------------------
-- event_days  [added migration 20260608000001]
-- One row per calendar date of an event, seeded by create_event for each date in
-- the range. `date` is the single source of truth for a day.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- event_segments  [added migration 20260608000001]
-- The "bigger grouping" within a day (e.g. Akad Nikah, Reception). name IS NULL
-- marks the default segment — the UI renders flat until a second is added.
-- event_id is denormalised for RLS (mirrors other child tables).
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_segments (
  id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id   uuid        NOT NULL,
  day_id     uuid        NOT NULL,
  name       text,
  sort_order integer     NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_segments_pkey PRIMARY KEY (id),
  CONSTRAINT event_segments_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id)     ON DELETE CASCADE,
  CONSTRAINT event_segments_day_id_fk
    FOREIGN KEY (day_id)   REFERENCES public.event_days (id) ON DELETE CASCADE
);

-- At most one default (NULL-name) segment per day.
CREATE UNIQUE INDEX event_segments_one_default_per_day
  ON public.event_segments (day_id) WHERE name IS NULL;

-- event_timelines.segment_id FK — added after event_segments exists (forward ref).
ALTER TABLE public.event_timelines
  ADD CONSTRAINT event_timelines_segment_id_fk
    FOREIGN KEY (segment_id) REFERENCES public.event_segments (id) ON DELETE CASCADE;

-- -----------------------------------------------------------------------------
-- event_resources  [confirmed]
-- Lookup table of resource definitions — seeded at event creation, read by
-- fetchAvailableResources() to drive the access matrix UI.
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_resources (
  id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  resource   text        NOT NULL,
  can_create boolean     NOT NULL DEFAULT false,
  can_read   boolean     NOT NULL DEFAULT false,
  can_update boolean     NOT NULL DEFAULT false,
  can_delete boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_role_permissions_pkey PRIMARY KEY (id)
);

-- -----------------------------------------------------------------------------
-- event_announcements  [confirmed]
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_announcements (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id     uuid        NOT NULL,
  created_by   uuid        NOT NULL,
  title        text        NOT NULL,
  body         text        NOT NULL,
  target_roles text[],
  expires_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_announcements_pkey PRIMARY KEY (id),

  CONSTRAINT event_announcements_event_id_fk
    FOREIGN KEY (event_id)   REFERENCES public.events (id)         ON DELETE CASCADE,
  CONSTRAINT event_announcements_created_by_fk
    FOREIGN KEY (created_by) REFERENCES public.event_members (id)  ON DELETE NO ACTION
);

-- -----------------------------------------------------------------------------
-- event_announcement_reads  [confirmed]
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_announcement_reads (
  id              uuid        NOT NULL DEFAULT gen_random_uuid(),
  announcement_id uuid        NOT NULL,
  member_id       uuid        NOT NULL,
  event_id        uuid        NOT NULL,
  read_at         timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_announcement_reads_pkey                         PRIMARY KEY (id),
  CONSTRAINT event_announcement_reads_announcement_id_member_id_key UNIQUE (announcement_id, member_id),

  CONSTRAINT event_announcement_reads_announcement_id_fk
    FOREIGN KEY (announcement_id) REFERENCES public.event_announcements (id) ON DELETE CASCADE,
  CONSTRAINT event_announcement_reads_member_id_fk
    FOREIGN KEY (member_id)       REFERENCES public.event_members (id)       ON DELETE CASCADE,
  CONSTRAINT event_announcement_reads_event_id_fk
    FOREIGN KEY (event_id)        REFERENCES public.events (id)              ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- event_live_logs  [confirmed]
-- Append-only log of live-event actions (timeline go-live messages, etc.)
-- member_snapshot is a denormalised display_name captured at write time.
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_live_logs (
  id              uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id        uuid        NOT NULL,
  member_snapshot text        NOT NULL,
  message         text        NOT NULL,
  expires_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_live_logs_pkey PRIMARY KEY (id),

  CONSTRAINT event_live_logs_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- event_vendors  [inferred — only FK and index data available]
-- TODO: run the column query and add missing fields here.
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_vendors (
  id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id   uuid        NOT NULL,
  -- [UNKNOWN COLUMNS — add from a fresh column query]
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_vendors_pkey PRIMARY KEY (id),

  CONSTRAINT event_vendors_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- push_subscriptions  [inferred from RLS policy + edge function + FK dump]
-- Stores Web Push API subscriptions per member/event.
-- -----------------------------------------------------------------------------
CREATE TABLE public.push_subscriptions (
  id        uuid NOT NULL DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  event_id  uuid NOT NULL,
  endpoint  text NOT NULL,
  p256dh    text NOT NULL,
  auth      text NOT NULL,
  -- [Additional columns may exist — verify with column query]

  CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id),

  -- One row per device endpoint PER EVENT (migration 20260606000001). Lets a
  -- single device hold a subscription for every event it has entered; the
  -- client upserts on (endpoint, event_id).
  CONSTRAINT push_subscriptions_endpoint_event_key UNIQUE (endpoint, event_id),

  CONSTRAINT push_subscriptions_member_id_fk
    FOREIGN KEY (member_id) REFERENCES public.event_members (id) ON DELETE CASCADE,
  CONSTRAINT push_subscriptions_event_id_fk
    FOREIGN KEY (event_id)  REFERENCES public.events (id)        ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- waitlist_signups  [inferred from RLS — INSERT-only for anon/authenticated]
-- Pre-launch "notify me at launch" email list. (Renamed from `subscribers` in
-- migration 20260606000000 to avoid confusion with push_subscriptions.)
-- -----------------------------------------------------------------------------
CREATE TABLE public.waitlist_signups (
  id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  email      text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT waitlist_signups_pkey PRIMARY KEY (id)
);


-- =============================================================================
-- VIEWS
-- =============================================================================

-- event_slugs — read-only projection of active events  [inferred from query shape]
CREATE OR REPLACE VIEW public.event_slugs AS
  SELECT id, slug, name, date_start, date_end
  FROM public.events
  WHERE deleted_at IS NULL;


-- =============================================================================
-- INDEXES  [confirmed]
-- (PKs and UNIQUE constraints are omitted — already defined in CREATE TABLE)
-- =============================================================================

CREATE INDEX event_roles_event_id_idx
  ON public.event_access_groups (event_id);

CREATE INDEX event_announcement_reads_announcement_id_idx
  ON public.event_announcement_reads (announcement_id);
CREATE INDEX event_announcement_reads_event_id_idx
  ON public.event_announcement_reads (event_id);
CREATE INDEX event_announcement_reads_member_id_idx
  ON public.event_announcement_reads (member_id);

CREATE INDEX event_announcements_event_id_idx
  ON public.event_announcements (event_id);
CREATE INDEX event_announcements_expires_at_idx
  ON public.event_announcements (expires_at);

-- event_invitation has a unique index backing its UNIQUE constraint (already covered above)

CREATE INDEX event_live_logs_event_id_idx
  ON public.event_live_logs (event_id);
CREATE INDEX event_live_logs_expires_at_idx
  ON public.event_live_logs (expires_at);

CREATE INDEX event_members_event_id_idx
  ON public.event_members (event_id);
CREATE INDEX event_members_user_id_idx
  ON public.event_members (user_id);
CREATE INDEX event_members_event_id_user_id_idx
  ON public.event_members (event_id, user_id);

CREATE INDEX event_rsvps_event_id_idx
  ON public.event_rsvps (event_id);
CREATE INDEX event_rsvps_event_id_status_idx
  ON public.event_rsvps (event_id, status);

CREATE INDEX event_tasks_event_id_idx
  ON public.event_tasks (event_id);
CREATE INDEX event_tasks_event_id_status_idx
  ON public.event_tasks (event_id, status);

CREATE UNIQUE INDEX event_templates_slug_idx
  ON public.event_templates (slug);
CREATE INDEX event_templates_is_active_idx
  ON public.event_templates (is_active);

CREATE INDEX event_themes_event_id_idx
  ON public.event_themes (event_id);
CREATE INDEX event_themes_template_id_idx
  ON public.event_themes (template_id);

CREATE INDEX event_timelines_event_id_idx
  ON public.event_timelines (event_id);
CREATE INDEX event_timelines_event_id_day_time_start_idx
  ON public.event_timelines (event_id, day, time_start);
-- Note: a duplicate index event_timelines_event_id_day_time_start_idx1 exists in prod — consider dropping it.
CREATE INDEX event_timelines_segment_id_idx
  ON public.event_timelines (segment_id);

CREATE INDEX event_days_event_id_idx
  ON public.event_days (event_id);

CREATE INDEX event_segments_event_id_idx
  ON public.event_segments (event_id);
CREATE INDEX event_segments_day_id_idx
  ON public.event_segments (day_id);
-- (event_segments_one_default_per_day partial unique index defined with the table)

CREATE INDEX event_vendors_event_id_idx
  ON public.event_vendors (event_id);

-- Unique index backing event_invitation UNIQUE (event_id)
CREATE UNIQUE INDEX event_invitation_event_id_idx
  ON public.event_invitation (event_id);


-- =============================================================================
-- RLS — ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.event_access_groups      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_announcements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_days               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_segments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_invitation         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_live_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_resources          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_settings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tasks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_templates          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_themes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_timelines          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_vendors            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_signups         ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- RLS POLICIES (SELECT)  [confirmed from live DB dump]
-- Note: as of migration 20260604000002, event_access_groups_select was updated.
-- The version below reflects the state AFTER that migration.
-- Mutations (INSERT/UPDATE/DELETE) are enforced by SECURITY DEFINER RPCs —
-- no separate DML policies were present in the dump.
-- =============================================================================

-- event_access_groups — updated by migration 20260604000002
CREATE POLICY event_access_groups_select ON public.event_access_groups
  FOR SELECT TO authenticated
  USING (is_event_member(event_id));

-- event_announcements — active members, filtered to their role if target_roles set
CREATE POLICY event_announcements_select ON public.event_announcements
  FOR SELECT TO authenticated
  USING (
    is_event_member(event_id)
    AND (
      target_roles IS NULL
      OR EXISTS (
        SELECT 1
        FROM event_members em
        JOIN event_access_groups r ON r.id = em.access_group_id
        WHERE em.event_id = event_announcements.event_id
          AND em.user_id  = auth.uid()
          AND r.name      = ANY(event_announcements.target_roles)
      )
    )
  );

CREATE POLICY event_days_select ON public.event_days
  FOR SELECT TO authenticated
  USING (is_event_member(event_id));

CREATE POLICY event_segments_select ON public.event_segments
  FOR SELECT TO authenticated
  USING (is_event_member(event_id));

CREATE POLICY event_invitation_select ON public.event_invitation
  FOR SELECT TO authenticated
  USING (is_event_member(event_id));

CREATE POLICY event_live_logs_select ON public.event_live_logs
  FOR SELECT TO authenticated
  USING (is_event_member(event_id));

CREATE POLICY event_members_select ON public.event_members
  FOR SELECT TO authenticated
  USING (is_event_member(event_id));

-- event_resources — open to all authenticated (resource list is non-sensitive)
CREATE POLICY event_role_permissions_select ON public.event_resources
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY event_rsvps_select ON public.event_rsvps
  FOR SELECT TO authenticated
  USING (is_event_member(event_id));

CREATE POLICY event_settings_select ON public.event_settings
  FOR SELECT TO authenticated
  USING (is_event_member(event_id));

CREATE POLICY event_tasks_select ON public.event_tasks
  FOR SELECT TO authenticated
  USING (is_event_member(event_id));

-- event_templates — global, visible to anyone authenticated if active
CREATE POLICY event_templates_select ON public.event_templates
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY event_themes_select ON public.event_themes
  FOR SELECT TO authenticated
  USING (is_event_member(event_id));

CREATE POLICY event_timelines_select ON public.event_timelines
  FOR SELECT TO authenticated
  USING (is_event_member(event_id));

CREATE POLICY event_vendors_select ON public.event_vendors
  FOR SELECT TO authenticated
  USING (is_event_member(event_id));

CREATE POLICY events_select ON public.events
  FOR SELECT TO authenticated
  USING (is_event_member(id));

-- push_subscriptions — member owns their own subscription row
CREATE POLICY "member owns subscription" ON public.push_subscriptions
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1 FROM event_members em
      WHERE em.id      = push_subscriptions.member_id
        AND em.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_members em
      WHERE em.id      = push_subscriptions.member_id
        AND em.user_id = auth.uid()
    )
  );

-- waitlist_signups — open insert for public launch-waitlist signups
CREATE POLICY waitlist_signups_insert ON public.waitlist_signups
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);


-- =============================================================================
-- HELPER / SECURITY PRIMITIVE FUNCTIONS
-- These are called by RLS policies and every RPC — do not rename or drop.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_event_active(p_event_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM events
    WHERE id = p_event_id AND deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_member(p_event_id uuid)
RETURNS event_members LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT * FROM event_members
  WHERE event_id  = p_event_id
    AND user_id   = auth.uid()
    AND joined_at IS NOT NULL
    AND frozen_at IS NULL
    AND is_event_active(p_event_id);
$$;

CREATE OR REPLACE FUNCTION public.is_event_member(p_event_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT (get_current_member(p_event_id)).id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.get_member_rank(p_member event_members)
RETURNS integer LANGUAGE sql STABLE AS $$
  SELECT CASE
    WHEN p_member.is_root                       THEN 0
    WHEN p_member.is_bride OR p_member.is_groom THEN 1
    ELSE 2
  END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(p_member event_members)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT p_member.is_root OR p_member.is_bride OR p_member.is_groom;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin_member(p_event_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT is_super_admin(get_current_member(p_event_id));
$$;

CREATE OR REPLACE FUNCTION public.has_event_permission(
  p_event_id uuid,
  p_resource  text,
  p_action    text
)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_caller      event_members;
  v_permissions jsonb;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN RETURN false; END IF;
  IF is_super_admin(v_caller) THEN RETURN true; END IF;

  SELECT ag.permissions INTO v_permissions
  FROM event_access_groups ag
  WHERE ag.id = v_caller.access_group_id;

  RETURN COALESCE((v_permissions -> p_resource ->> p_action)::boolean, false);
END;
$$;


-- =============================================================================
-- BOOTSTRAP / AUTH FUNCTION
-- Updated by migration 20260604000001 to return distinguishable lockout signals.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_bootstrap_context(p_slug text)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_event        events;
  v_member       event_members;
  v_access_group event_access_groups;
BEGIN
  SELECT * INTO v_event
  FROM events WHERE slug = p_slug AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  SELECT * INTO v_member
  FROM event_members
  WHERE event_id = v_event.id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF v_member.rejected_at IS NOT NULL THEN
    RAISE EXCEPTION 'MEMBER_REMOVED: Your access to this event has been removed';
  END IF;

  IF v_member.frozen_at IS NOT NULL THEN
    RAISE EXCEPTION 'MEMBER_SUSPENDED: Your access to this event has been suspended';
  END IF;

  IF v_member.joined_at IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  SELECT * INTO v_access_group
  FROM event_access_groups WHERE id = v_member.access_group_id;

  RETURN json_build_object(
    'event_id',   v_event.id,
    'slug',       v_event.slug,
    'event_name', v_event.name,
    'date_start', v_event.date_start,
    'date_end',   v_event.date_end,
    'member', json_build_object(
      'id',           v_member.id,
      'display_name', v_member.display_name,
      'role',         v_member.role,
      'is_root',      v_member.is_root,
      'is_bride',     v_member.is_bride,
      'is_groom',     v_member.is_groom
    ),
    'access_group', json_build_object(
      'id',          v_access_group.id,
      'name',        v_access_group.name,
      'permissions', v_access_group.permissions
    )
  );
END;
$$;


-- =============================================================================
-- BUSINESS LOGIC RPCs
-- All are SECURITY DEFINER and enforce membership + permissions internally.
-- Full definitions confirmed from live DB dump.
-- =============================================================================

-- [Paste full RPC definitions here from the function dump you shared earlier.
--  They are omitted here to avoid duplication — the dump you provided on
--  2026-06-04 is the authoritative source and should be appended below.]

-- Functions to add (copy from the dump):
--   create_event, create_access_group, update_access_group, delete_access_group
--   invite_member, update_member, update_member_couple, update_member_access_group,
--   freeze_member, delete_member, claim_member_invite
--   create_guests, update_guests, delete_guest, import_guests_csv (if exists), cancel_rsvp,
--   submit_rsvp (if exists), update_rsvp (if exists)
--   create_task, update_task, delete_task, archive_tasks, save_task_order, mark_task_done
--   create_timeline, update_timeline, delete_timeline, start_timeline, end_timeline
--   create_theme, update_theme, delete_theme, publish_theme
--   update_invitation, update_event, update_profile, change_password, delete_event
--   fetch_events, fetch_pending_invites (if RPCs, else direct selects)

-- update_notification_preferences — member edits their OWN notification feature
-- flags (added by migration 20260606000001). Merges into
-- event_members.preferences->'notifications'; default-on by absence.
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


-- =============================================================================
-- DAY / SEGMENT SPINE — RPCs  [added migration 20260608000003]
-- Day + default-segment seeding is explicit in create_event (no trigger).
-- Segment CRUD RPCs below are gated on the `timeline` resource.
-- =============================================================================

-- create_segment — add a named segment to a day.
CREATE OR REPLACE FUNCTION public.create_segment(p_event_id uuid, p_day_id uuid, p_name text)
RETURNS event_segments LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_seg   event_segments;
  v_order integer;
BEGIN
  IF NOT has_event_permission(p_event_id, 'timeline', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to add segments';
  END IF;

  IF btrim(COALESCE(p_name, '')) = '' THEN
    RAISE EXCEPTION 'Segment name is required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM event_days WHERE id = p_day_id AND event_id = p_event_id
  ) THEN
    RAISE EXCEPTION 'Day not found for this event';
  END IF;

  SELECT COALESCE(max(sort_order), -1) + 1 INTO v_order
  FROM event_segments WHERE day_id = p_day_id;

  INSERT INTO event_segments (event_id, day_id, name, sort_order)
  VALUES (p_event_id, p_day_id, btrim(p_name), v_order)
  RETURNING * INTO v_seg;

  RETURN v_seg;
END;
$$;

-- update_segment — rename a segment.
CREATE OR REPLACE FUNCTION public.update_segment(p_event_id uuid, p_id uuid, p_name text)
RETURNS event_segments LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_seg event_segments;
BEGIN
  IF NOT has_event_permission(p_event_id, 'timeline', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to update segments';
  END IF;

  IF btrim(COALESCE(p_name, '')) = '' THEN
    RAISE EXCEPTION 'Segment name is required';
  END IF;

  UPDATE event_segments
  SET name = btrim(p_name)
  WHERE id = p_id AND event_id = p_event_id
  RETURNING * INTO v_seg;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Segment not found';
  END IF;

  RETURN v_seg;
END;
$$;

-- delete_segment — reassign its items to an adjacent segment, then delete.
CREATE OR REPLACE FUNCTION public.delete_segment(p_event_id uuid, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_seg    event_segments;
  v_target uuid;
  v_count  integer;
BEGIN
  IF NOT has_event_permission(p_event_id, 'timeline', 'delete') THEN
    RAISE EXCEPTION 'Insufficient permission to delete segments';
  END IF;

  SELECT * INTO v_seg
  FROM event_segments WHERE id = p_id AND event_id = p_event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Segment not found';
  END IF;

  SELECT count(*) INTO v_count
  FROM event_segments WHERE day_id = v_seg.day_id;
  IF v_count <= 1 THEN
    RAISE EXCEPTION 'A day must keep at least one segment';
  END IF;

  SELECT id INTO v_target
  FROM event_segments
  WHERE day_id = v_seg.day_id AND id <> p_id AND sort_order < v_seg.sort_order
  ORDER BY sort_order DESC
  LIMIT 1;

  IF v_target IS NULL THEN
    SELECT id INTO v_target
    FROM event_segments
    WHERE day_id = v_seg.day_id AND id <> p_id
    ORDER BY sort_order ASC
    LIMIT 1;
  END IF;

  UPDATE event_timelines SET segment_id = v_target WHERE segment_id = p_id;

  DELETE FROM event_segments WHERE id = p_id;
END;
$$;

-- reorder_segments — set sort_order from the given id order, within one day.
CREATE OR REPLACE FUNCTION public.reorder_segments(p_event_id uuid, p_day_id uuid, p_ids uuid[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT has_event_permission(p_event_id, 'timeline', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to reorder segments';
  END IF;

  UPDATE event_segments es
  SET sort_order = pos.ord - 1
  FROM (
    SELECT id, ord FROM unnest(p_ids) WITH ORDINALITY AS t(id, ord)
  ) pos
  WHERE es.id = pos.id
    AND es.event_id = p_event_id
    AND es.day_id   = p_day_id;
END;
$$;


-- =============================================================================
-- TRIGGERS  [confirmed from live DB dump]
-- =============================================================================

-- touch_updated_at fires on every table that has an updated_at column.
-- The auto_attach_table_triggers event trigger wires this automatically on
-- new tables — existing tables listed explicitly below.

CREATE TRIGGER touch_updated_at_event_access_groups
  BEFORE UPDATE ON public.event_access_groups
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER touch_updated_at_event_announcement_reads
  BEFORE UPDATE ON public.event_announcement_reads
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER touch_updated_at_event_announcements
  BEFORE UPDATE ON public.event_announcements
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- event_days / event_segments touch triggers are auto-attached by
-- auto_attach_triggers_on_create at CREATE TABLE time (listed for completeness).
CREATE TRIGGER touch_updated_at_event_days
  BEFORE UPDATE ON public.event_days
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER touch_updated_at_event_segments
  BEFORE UPDATE ON public.event_segments
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER touch_updated_at_event_invitation
  BEFORE UPDATE ON public.event_invitation
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER touch_updated_at_event_live_logs
  BEFORE UPDATE ON public.event_live_logs
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER touch_updated_at_event_members
  BEFORE UPDATE ON public.event_members
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER touch_updated_at_event_role_permissions
  BEFORE UPDATE ON public.event_resources
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER touch_updated_at_event_rsvps
  BEFORE UPDATE ON public.event_rsvps
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER touch_updated_at_event_settings
  BEFORE UPDATE ON public.event_settings
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER touch_updated_at_event_tasks
  BEFORE UPDATE ON public.event_tasks
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER touch_updated_at_event_templates
  BEFORE UPDATE ON public.event_templates
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER touch_updated_at_event_themes
  BEFORE UPDATE ON public.event_themes
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER touch_updated_at_event_timelines
  BEFORE UPDATE ON public.event_timelines
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER touch_updated_at_event_vendors
  BEFORE UPDATE ON public.event_vendors
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER touch_updated_at_events
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Timeline go-live trigger — calls the send-timeline-push edge function
-- when started_at transitions from NULL to a timestamp.
CREATE TRIGGER "on-timeline-start"
  AFTER UPDATE ON public.event_timelines
  FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request(
    'https://rkjclutzuoovuzsatlon.supabase.co/functions/v1/send-timeline-push',
    'POST',
    '{"Content-type":"application/json","Authorization":"Bearer <service_role_key>"}',
    '{}',
    '10000'
  );

-- Event trigger: automatically attaches touch_updated_at to any new table
-- that has an updated_at column.
CREATE OR REPLACE FUNCTION public.auto_attach_table_triggers()
RETURNS event_trigger LANGUAGE plpgsql AS $$
DECLARE
  v_table       text;
  v_table_short text;
BEGIN
  SELECT object_identity INTO v_table
  FROM pg_event_trigger_ddl_commands()
  WHERE command_tag = 'CREATE TABLE'
  LIMIT 1;

  IF v_table IS NULL THEN RETURN; END IF;

  v_table_short := replace(v_table, 'public.', '');

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = v_table_short
      AND column_name  = 'updated_at'
  ) THEN
    EXECUTE format(
      'CREATE TRIGGER touch_updated_at_%s
         BEFORE UPDATE ON %s
         FOR EACH ROW EXECUTE FUNCTION touch_updated_at()',
      v_table_short, v_table
    );
  END IF;
END;
$$;

CREATE EVENT TRIGGER auto_attach_triggers_on_create
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE')
  EXECUTE FUNCTION auto_attach_table_triggers();


-- =============================================================================
-- KNOWN GAPS — fill these in after running the missing queries
-- =============================================================================
-- 1. event_vendors column definitions (only FK + index confirmed)
-- 2. push_subscriptions full column list (endpoint/p256dh/auth inferred)
-- 3. events full column list (inferred from RPCs — verify nullable/defaults)
-- 4. event_tasks archived_at / assignees column defaults (inferred)
-- 5. Full RPC function bodies (copy from the 2026-06-04 function dump)
-- 6. Any INSERT/UPDATE/DELETE RLS policies (none found in dump — confirm intentional)
-- =============================================================================
