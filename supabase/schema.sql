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
--   20260606000000_rename_subscribers_waitlist       — rename subscribers → waitlist.
--   20260606000001_push_per_event_and_prefs          — push notification tokens +
--       per-member notification preferences (event_members.preferences jsonb).
--   20260608000001_event_days_segments_tables        — event_days + event_segments
--       tables; timeline items gain segment_id FK replacing the day_id direct link.
--   20260608000002_event_days_segments_backfill      — backfill existing timeline
--       rows into the new segment spine.
--   20260608000003_event_days_segments_rpcs          — create/update/delete segment
--       RPCs; create_event seeds one default segment per day.
--   20260608000004_timeline_segment_writes           — create_timeline / update_timeline
--       rewritten to address segment_id instead of day.
--   20260608000005_segment_update_rpc               — update_segment RPC.
--   20260608000006_timeline_drop_day_rpcs            — drop legacy day-scoped timeline
--       RPCs superseded by the segment spine.
--   20260608000010_tasks_position_engine             — per-row fractional `position`
--       on event_tasks (replaces task_order jsonb); move_task (drag) gated on
--       tasks:update only; update_task / delete_task keep creator/assignee carve-outs.
--   20260608000011_drop_task_order                   — drop the dormant task_order column.
--   20260610000001_budget_tracker                    — event_budget + event_expenses
--       tables; budget CRUD RPCs; budget resource added to access catalog.
--   20260610000101_member_invite_link                — token-based invite links
--       (invite_token + invite_expires_at on event_members); event_members.email
--       dropped; get_user_events drops passive email-match discovery.
--   20260610000102_invalidate_invite_token_on_use    — rotate invite token on claim
--       so the link can't be reused.
--   20260610000201_assignee_rule                     — is_assignable_member +
--       assert_added_assignees_assignable helpers; task + timeline write RPCs
--       guard newly-added assignees against frozen/expired members.
--   20260611000001_event_days_label                  — event_days.label (NOT NULL);
--       create_day requires a label; existing rows backfilled.
--   20260611000002_slug_reservations                 — slug_reservations table +
--       reserve_slug / release_slug RPCs; is_slug_taken helper.
--   20260611000003_event_day_crud_rpcs               — create_day / delete_day RPCs
--       (delete guards ≥1-day invariant and cascades segments/timeline items).
--   20260611000004_slug_reservations_cron            — cron job to expire stale
--       slug reservations after 30 minutes.
--   20260611000005_event_dates_from_days             — drop events.date_start /
--       date_end (derived from event_days); events_with_dates view; create_event
--       signature changes to p_days jsonb (labeled day set).
--   20260612000001_delete_day_guard_items            — delete_day raises if the day
--       has timeline items (RESTRICT); tasks are event-scoped so no guard needed.
--   20260612000002_days_super_admin_only             — event_days + event_segments
--       writes restricted to super-admin (create/delete/update day RPCs gated on
--       is_super_admin_member).
--   20260612000101_budget_per_day_super_admin        — event_budget becomes per-day
--       buckets (day_id NOT NULL); budget reads/writes restricted to super-admin
--       (is_super_admin_member); budget resource stripped from all access groups;
--       Team gains access:read; create_event drops eager budget seed (lazy per day).
--   20260612000201_revoke_helper_functions           — REVOKE EXECUTE on internal
--       helper functions (get_or_create_budget_bucket etc.) from public/anon/authenticated.
--   20260613000001_day_delete_restrict_timeline      — delete_day raises if the day
--       has timeline items (RESTRICT guard added server-side).
--   20260613000002_team_tasks_read                   — Team tasks permission
--       full → read; existing Team groups backfilled; create_event updated.
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
-- The date span (date_start/date_end) is NOT stored — it is derived from
-- event_days on read via the events_with_dates view (migration 20260611000005).
-- -----------------------------------------------------------------------------
CREATE TABLE public.events (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  slug         text        NOT NULL,
  name         text        NOT NULL,
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
  invite_token    text                 DEFAULT encode(gen_random_bytes(32), 'hex'),  -- shareable invite link; NULLed once claimed (spent credential — 20260610000102)
  invite_expires_at timestamptz         DEFAULT now() + interval '7 days',           -- link deadline; reset on regenerate, NULLed once claimed (invited_at stays immutable)
  display_name    text        NOT NULL,
  invited_at      timestamptz NOT NULL DEFAULT now(),
  joined_at       timestamptz,
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
-- event_settings  [confirmed] — all-member config (task_order dropped in
--   20260608000011). Stays uniformly all-member; gated config lives elsewhere.
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_settings (
  id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id   uuid        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_settings_pkey         PRIMARY KEY (id),
  CONSTRAINT event_settings_event_id_key UNIQUE (event_id),

  CONSTRAINT event_settings_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- event_budget  [20260610000001; per-day buckets + super-admin 20260612000101]
--   One bucket per (event, day_id NOT NULL — like event_segments); holds that
--   day's budget_total. Super-admin only (the couple), not the `budget` resource.
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_budget (
  id           uuid          NOT NULL DEFAULT gen_random_uuid(),
  event_id     uuid          NOT NULL,
  day_id       uuid          NOT NULL,
  budget_total numeric(12,2),
  created_at   timestamptz   NOT NULL DEFAULT now(),
  updated_at   timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT event_budget_pkey          PRIMARY KEY (id),
  CONSTRAINT event_budget_event_day_key UNIQUE (event_id, day_id),
  CONSTRAINT event_budget_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id)     ON DELETE CASCADE,
  CONSTRAINT event_budget_day_id_fk
    FOREIGN KEY (day_id)   REFERENCES public.event_days (id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- event_expenses  [20260610000001 — Budget Tracker]
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_expenses (
  id          uuid          NOT NULL DEFAULT gen_random_uuid(),
  event_id    uuid          NOT NULL,
  budget_id   uuid          NOT NULL,                 -- the (event,day) bucket [20260612000101]
  item        text          NOT NULL,
  vendor_name text,
  payer       text,
  amount      numeric(12,2) NOT NULL DEFAULT 0,
  paid        numeric(12,2) NOT NULL DEFAULT 0,
  due_at      date,
  notes       text,
  created_by  uuid,
  created_at  timestamptz   NOT NULL DEFAULT now(),
  updated_at  timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT event_expenses_pkey PRIMARY KEY (id),
  CONSTRAINT event_expenses_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE,
  CONSTRAINT event_expenses_budget_id_fk
    FOREIGN KEY (budget_id) REFERENCES public.event_budget (id) ON DELETE RESTRICT,
  CONSTRAINT event_expenses_created_by_fk
    FOREIGN KEY (created_by) REFERENCES public.event_members (id) ON DELETE SET NULL,
  CONSTRAINT event_expenses_amount_chk CHECK (amount >= 0),
  CONSTRAINT event_expenses_paid_chk   CHECK (paid >= 0)
);
CREATE INDEX event_expenses_event_id_idx  ON public.event_expenses (event_id);
CREATE INDEX event_expenses_budget_id_idx ON public.event_expenses (budget_id);

-- -----------------------------------------------------------------------------
-- event_gifts  [20260613000002 — Gift Envelopes]
-- Per-day cash-gift ledger (ang bao / sampul duit / shagun). Super-admin only.
-- `day_id` (NOT NULL) tags the gift's event_day; create_gift defaults a NULL pick
-- to the event's earliest day. ON DELETE RESTRICT — delete_day blocks on gifts.
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_gifts (
  id         uuid          NOT NULL DEFAULT gen_random_uuid(),
  event_id   uuid          NOT NULL,
  given_by   text          NOT NULL,
  amount     numeric(12,2) NOT NULL DEFAULT 0,
  method     text          NOT NULL DEFAULT 'envelope',
  notes      text,
  day_id     uuid          NOT NULL,
  created_at timestamptz   NOT NULL DEFAULT now(),
  updated_at timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT event_gifts_pkey PRIMARY KEY (id),
  CONSTRAINT event_gifts_event_id_fk
    FOREIGN KEY (event_id)   REFERENCES public.events (id)        ON DELETE CASCADE,
  CONSTRAINT event_gifts_day_id_fk
    FOREIGN KEY (day_id)     REFERENCES public.event_days (id)    ON DELETE RESTRICT,
  CONSTRAINT event_gifts_amount_chk CHECK (amount >= 0),
  CONSTRAINT event_gifts_method_chk
    CHECK (method IN ('envelope', 'cash', 'transfer', 'others'))
);
CREATE INDEX event_gifts_event_id_idx ON public.event_gifts (event_id);

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
-- event_days  [added migration 20260608000001; label added 20260611000001]
-- One row per event date — NOT necessarily contiguous (a wedding week may skip
-- days). create_event seeds the dates picked in the wizard; create_day/delete_day
-- maintain the set afterward. `date` is the day's identity; `label` is a
-- required human name ("Mehndi Night") — every day must be named.
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_days (
  id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id   uuid        NOT NULL,
  date       date        NOT NULL,
  label      text        NOT NULL,
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
-- RESTRICT (not CASCADE): a segment holding items blocks a day-delete on every
-- path — the FK tripwire behind delete_day's item guard. [20260613000001]
ALTER TABLE public.event_timelines
  ADD CONSTRAINT event_timelines_segment_id_fk
    FOREIGN KEY (segment_id) REFERENCES public.event_segments (id) ON DELETE RESTRICT;

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

-- -----------------------------------------------------------------------------
-- slug_reservations  [added migration 20260611000002]
-- Holds a slug for a user while they fill the create-event wizard so two people
-- can't race for the same URL. Sliding 30-min TTL — re-reserving your own slug
-- refreshes the hold ("Keep it"); expiry is lazy (ignored by checks, overwritten
-- on next reserve). expires_at IS NULL = a permanent reservation that never expires —
-- reserved for future system blocklist slugs. Reachable only via the SECURITY
-- DEFINER reserve/release/is_slug_taken RPCs.
-- -----------------------------------------------------------------------------
CREATE TABLE public.slug_reservations (
  slug       text        NOT NULL,
  user_id    uuid        NOT NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT slug_reservations_pkey PRIMARY KEY (slug)
);


-- =============================================================================
-- VIEWS
-- =============================================================================

-- events_with_dates — read-only projection: each event + its date span derived
-- from event_days (min/max). The single place the span is computed; replaces the
-- stored date_start/date_end columns (migration 20260611000005). Explicit column
-- list (not e.*) so it doesn't depend on dropped columns. LEFT JOIN so an event
-- is never lost — the ≥1-day invariant means the span is never actually null.
-- (Superseded event_slugs, which is now dropped — is_slug_taken is the slug gate.)
-- SECURITY DEFINER (security_invoker = false, explicit per policy) → bypasses RLS,
-- so it is INTERNAL ONLY: only the SECURITY DEFINER readers (get_user_events,
-- get_bootstrap_context) use it. Access is revoked from client roles so the
-- definer view can't leak rows directly.
CREATE OR REPLACE VIEW public.events_with_dates
WITH (security_invoker = false) AS
  SELECT e.id, e.slug, e.name, e.deleted_at,
         d.date_start, d.date_end
  FROM public.events e
  LEFT JOIN (
    SELECT event_id, min(date) AS date_start, max(date) AS date_end
    FROM public.event_days
    GROUP BY event_id
  ) d ON d.event_id = e.id;

REVOKE ALL ON public.events_with_dates FROM anon, authenticated;


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
CREATE UNIQUE INDEX event_members_invite_token_key
  ON public.event_members (invite_token);

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
ALTER TABLE public.event_budget             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_expenses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_gifts              ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.slug_reservations        ENABLE ROW LEVEL SECURITY;
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

-- Own row ONLY (not is_event_member): the roster list is read solely via the
-- get_members RPC, which tiers fields by role and never leaks pending invite
-- tokens. A broad is_event_member(event_id) here would let any member directly
-- SELECT every row — including invite_token — bypassing that masking. Own-row
-- keeps realtime self-resync working without exposing anyone else. Set by
-- 20260605000004_member_email_protection; this dump previously mis-recorded the
-- old broad policy.
CREATE POLICY event_members_select ON public.event_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

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

-- Budget tables — the couple's eyes only. Reads (here) + writes (RPCs) are
-- super-admin only; the `budget` resource is no longer checked. 20260612000101.
CREATE POLICY event_budget_select ON public.event_budget
  FOR SELECT TO authenticated
  USING (is_super_admin_member(event_id));

CREATE POLICY event_expenses_select ON public.event_expenses
  FOR SELECT TO authenticated
  USING (is_super_admin_member(event_id));

-- event_gifts — super-admin only (the couple); no write policies (RPCs only).
CREATE POLICY event_gifts_select ON public.event_gifts
  FOR SELECT TO authenticated
  USING (is_super_admin_member(event_id));

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
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_event_active(p_event_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM events
    WHERE id = p_event_id AND deleted_at IS NULL
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_event_active(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_current_member(p_event_id uuid)
RETURNS event_members LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT * FROM event_members
  WHERE event_id  = p_event_id
    AND user_id   = auth.uid()
    AND joined_at IS NOT NULL
    AND frozen_at IS NULL
    AND is_event_active(p_event_id);
$$;
REVOKE EXECUTE ON FUNCTION public.get_current_member(uuid) FROM PUBLIC, anon, authenticated;

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
REVOKE EXECUTE ON FUNCTION public.get_member_rank(event_members) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_super_admin(p_member event_members)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT p_member.is_root OR p_member.is_bride OR p_member.is_groom;
$$;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(event_members) FROM PUBLIC, anon, authenticated;

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
REVOKE EXECUTE ON FUNCTION public.has_event_permission(uuid, text, text) FROM PUBLIC, anon;
-- authenticated must retain EXECUTE: event_rsvps_select calls this in its USING clause.
GRANT EXECUTE ON FUNCTION public.has_event_permission(uuid, text, text) TO authenticated;

-- Assignee rule predicate + guard (used by create/update task & timeline RPCs).
CREATE OR REPLACE FUNCTION public.is_assignable_member(p_event_id uuid, p_member_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM event_members m
    WHERE m.id = p_member_id AND m.event_id = p_event_id
      AND m.frozen_at IS NULL
      AND (m.joined_at IS NOT NULL OR m.invite_expires_at > now())
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_assignable_member(uuid, uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.assert_added_assignees_assignable(
  p_event_id uuid, p_new uuid[], p_existing uuid[]
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF p_new IS NULL THEN RETURN; END IF;
  IF EXISTS (
    SELECT 1 FROM unnest(p_new) AS a(id)
    WHERE a.id <> ALL (p_existing) AND NOT is_assignable_member(p_event_id, a.id)
  ) THEN
    RAISE EXCEPTION 'New assignees must be active or pending members of this event';
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.assert_added_assignees_assignable(uuid, uuid[], uuid[]) FROM PUBLIC, anon, authenticated;


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
  v_start        date;
  v_end          date;
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

  IF v_member.frozen_at IS NOT NULL THEN
    RAISE EXCEPTION 'MEMBER_SUSPENDED: Your access to this event has been suspended';
  END IF;

  IF v_member.joined_at IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  SELECT * INTO v_access_group
  FROM event_access_groups WHERE id = v_member.access_group_id;

  -- Span derived from event_days (single source of truth).
  SELECT date_start, date_end INTO v_start, v_end
  FROM events_with_dates WHERE id = v_event.id;

  RETURN json_build_object(
    'event_id',   v_event.id,
    'slug',       v_event.slug,
    'event_name', v_event.name,
    'date_start', v_start,
    'date_end',   v_end,
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

-- create_event  [last updated: 20260613000002_team_tasks_read]
CREATE OR REPLACE FUNCTION public.create_event(
  p_slug         text,
  p_name         text,
  p_days         jsonb,
  p_display_name text,
  p_role         text
)
RETURNS TABLE(id uuid, slug text, name text, date_start date, date_end date, is_pending boolean)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id   uuid := auth.uid();
  v_event_id  uuid;
  v_slug      text;
  v_admin_id  uuid;
  v_team_id   uuid;
  v_member_id uuid;
  v_day_id    uuid;
  v_start     date;
  v_end       date;
  rec         record;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to create an event';
  END IF;

  IF p_days IS NULL OR jsonb_array_length(p_days) = 0 THEN
    RAISE EXCEPTION 'Select at least one event day';
  END IF;

  IF is_slug_taken(p_slug) THEN
    RAISE EXCEPTION 'This URL is already taken' USING ERRCODE = 'unique_violation';
  END IF;

  SELECT min((d->>'date')::date), max((d->>'date')::date)
  INTO v_start, v_end
  FROM jsonb_array_elements(p_days) AS d;

  INSERT INTO events (slug, name)
  VALUES (p_slug, p_name)
  RETURNING events.id, events.slug INTO v_event_id, v_slug;

  -- No budget grant — budget is super-admin only (the couple), enforced by the
  -- RPCs/RLS. The `budget` resource stays in the catalog for discovery.
  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Admin', '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "themes":"full","members":"full","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_admin_id;

  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Team', '{
    "timeline":"full","tasks":"read","members":"read","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_team_id;

  INSERT INTO event_members (
    event_id, user_id, display_name, access_group_id,
    role, is_root, is_bride, is_groom, invited_at, joined_at
  )
  VALUES (
    v_event_id, v_user_id, p_display_name, v_admin_id,
    p_role, true, (p_role = 'Bride'), (p_role = 'Groom'), now(), now()
  )
  RETURNING event_members.id INTO v_member_id;

  UPDATE events SET created_by = v_member_id WHERE events.id = v_event_id;

  INSERT INTO event_invitation (event_id) VALUES (v_event_id);
  INSERT INTO event_settings (event_id) VALUES (v_event_id);
  -- (no event_budget seed — buckets are lazy, per day)

  FOR rec IN
    SELECT DISTINCT ON (dt) dt AS date, lbl AS label
    FROM (
      SELECT (d->>'date')::date              AS dt,
             btrim(COALESCE(d->>'label', '')) AS lbl
      FROM jsonb_array_elements(p_days) AS d
    ) s
    ORDER BY dt
  LOOP
    IF rec.label = '' THEN
      RAISE EXCEPTION 'Each event day needs a label';
    END IF;

    INSERT INTO event_days (event_id, date, label)
    VALUES (v_event_id, rec.date, rec.label)
    RETURNING event_days.id INTO v_day_id;

    INSERT INTO event_segments (event_id, day_id, name, sort_order)
    VALUES (v_event_id, v_day_id, NULL, 0);
  END LOOP;

  DELETE FROM slug_reservations WHERE user_id = v_user_id;

  RETURN QUERY
  SELECT v_event_id, v_slug, p_name, v_start, v_end, false;
END;
$$;

-- Functions still to add (copy from the dump):
--   create_access_group, update_access_group, delete_access_group
--   invite_member, update_member, update_member_couple, update_member_access_group,
--   freeze_member, delete_member, claim_member_invite, regenerate_member_invite
--   create_guests, update_guests, delete_guest, import_guests_csv (if exists), cancel_rsvp,
--   submit_rsvp (if exists), update_rsvp (if exists)
--   create_task, update_task, delete_task, archive_tasks, move_task
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
-- BUDGET — RPCs  [20260610000001; per-day + super-admin 20260612000101]
-- Super-admin only (the couple). Expenses live in event_expenses.budget_id ->
-- event_budget(day_id) -> event_days. Buckets are lazy (per day).
-- =============================================================================

-- Find-or-create the (event, day) bucket; NULL day -> the event's earliest day.
-- Internal to the budget RPCs (they've already checked super-admin).
CREATE OR REPLACE FUNCTION public.get_or_create_budget_bucket(p_event_id uuid, p_day_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_day uuid;
  v_id  uuid;
BEGIN
  v_day := COALESCE(
    p_day_id,
    (SELECT id FROM event_days WHERE event_id = p_event_id ORDER BY date, id LIMIT 1)
  );

  IF v_day IS NULL THEN
    RAISE EXCEPTION 'Event has no days';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM event_days WHERE id = v_day AND event_id = p_event_id) THEN
    RAISE EXCEPTION 'Day does not belong to this event';
  END IF;

  SELECT id INTO v_id FROM event_budget
  WHERE event_id = p_event_id AND day_id = v_day;

  IF v_id IS NULL THEN
    INSERT INTO event_budget (event_id, day_id) VALUES (p_event_id, v_day)
    RETURNING id INTO v_id;
  END IF;

  RETURN v_id;
END;
$$;

-- Internal only — the budget RPCs call it as definer; not exposed to the FE
-- (it writes rows with no super-admin check of its own).
REVOKE EXECUTE ON FUNCTION public.get_or_create_budget_bucket(uuid, uuid)
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_expense(
  p_event_id    uuid,
  p_item        text,
  p_vendor_name text    DEFAULT NULL,
  p_payer       text    DEFAULT NULL,
  p_amount      numeric DEFAULT 0,
  p_paid        numeric DEFAULT 0,
  p_due_at      date    DEFAULT NULL,
  p_notes       text    DEFAULT NULL,
  p_day_id      uuid    DEFAULT NULL
)
RETURNS event_expenses LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller    event_members;
  v_budget_id uuid;
  v_row       event_expenses;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Insufficient permission to create expenses';
  END IF;

  IF btrim(COALESCE(p_item, '')) = '' THEN
    RAISE EXCEPTION 'Item is required';
  END IF;

  IF COALESCE(p_amount, 0) < 0 OR COALESCE(p_paid, 0) < 0 THEN
    RAISE EXCEPTION 'Amounts or paid cannot be negative';
  END IF;

  IF COALESCE(p_paid, 0) > COALESCE(p_amount, 0) THEN
    RAISE EXCEPTION 'Paid cannot exceed the amount';
  END IF;

  v_budget_id := get_or_create_budget_bucket(p_event_id, p_day_id);

  INSERT INTO event_expenses (
    event_id, budget_id, item, vendor_name, payer, amount, paid, due_at, notes, created_by
  )
  VALUES (
    p_event_id, v_budget_id, btrim(p_item), p_vendor_name, p_payer,
    COALESCE(p_amount, 0), COALESCE(p_paid, 0), p_due_at, p_notes, v_caller.id
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_expense(
  p_event_id    uuid,
  p_id          uuid,
  p_item        text    DEFAULT NULL,
  p_vendor_name text    DEFAULT NULL,
  p_payer       text    DEFAULT NULL,
  p_amount      numeric DEFAULT NULL,
  p_paid        numeric DEFAULT NULL,
  p_due_at      date    DEFAULT NULL,
  p_notes       text    DEFAULT NULL,
  p_day_id      uuid    DEFAULT NULL
)
RETURNS event_expenses LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller    event_members;
  v_expense   event_expenses;
  v_budget_id uuid;
  v_amount    numeric;
  v_paid      numeric;
BEGIN
  SELECT * INTO v_expense FROM event_expenses WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Expense not found';
  END IF;

  IF v_expense.event_id != p_event_id THEN
    RAISE EXCEPTION 'Expense does not belong to this event';
  END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Insufficient permission to update expenses';
  END IF;

  v_amount := COALESCE(p_amount, v_expense.amount);
  v_paid   := COALESCE(p_paid, v_expense.paid);

  IF v_amount < 0 OR v_paid < 0 THEN
    RAISE EXCEPTION 'Amounts or paid cannot be negative';
  END IF;

  IF v_paid > v_amount THEN
    RAISE EXCEPTION 'Paid cannot exceed the amount';
  END IF;

  v_budget_id := get_or_create_budget_bucket(p_event_id, p_day_id);

  UPDATE event_expenses
  SET
    budget_id   = v_budget_id,
    item        = COALESCE(NULLIF(btrim(p_item), ''), item),
    vendor_name = p_vendor_name,
    payer       = p_payer,
    amount      = v_amount,
    paid        = v_paid,
    due_at      = p_due_at,
    notes       = p_notes
  WHERE id = p_id
  RETURNING * INTO v_expense;

  RETURN v_expense;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_expense(p_event_id uuid, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller  event_members;
  v_expense event_expenses;
BEGIN
  SELECT * INTO v_expense FROM event_expenses WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Expense not found';
  END IF;

  IF v_expense.event_id != p_event_id THEN
    RAISE EXCEPTION 'Expense does not belong to this event';
  END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Insufficient permission to delete expenses';
  END IF;

  DELETE FROM event_expenses WHERE id = p_id;
END;
$$;

-- Set (or clear, when p_amount IS NULL) the cap on the (event, day) bucket.
-- NULL p_day_id resolves to the event's earliest day. Super-admin only.
CREATE OR REPLACE FUNCTION public.update_budget(p_event_id uuid, p_amount numeric, p_day_id uuid DEFAULT NULL)
RETURNS event_budget LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller    event_members;
  v_budget_id uuid;
  v_row       event_budget;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Insufficient permission to update the budget';
  END IF;

  IF p_amount IS NOT NULL AND p_amount < 0 THEN
    RAISE EXCEPTION 'Budget cannot be negative';
  END IF;

  v_budget_id := get_or_create_budget_bucket(p_event_id, p_day_id);

  UPDATE event_budget
  SET budget_total = p_amount
  WHERE id = v_budget_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;


-- =============================================================================
-- GIFT ENVELOPES — RPCs  [added migration 20260613000002]
-- Cash-gift ledger writes; super-admin only (gated on is_super_admin).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_gift(
  p_event_id uuid,
  p_given_by text,
  p_amount   numeric DEFAULT 0,
  p_method   text    DEFAULT 'envelope',
  p_notes    text    DEFAULT NULL,
  p_day_id   uuid    DEFAULT NULL
)
RETURNS event_gifts LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_day    uuid;
  v_row    event_gifts;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Insufficient permission to record gifts';
  END IF;

  IF btrim(COALESCE(p_given_by, '')) = '' THEN
    RAISE EXCEPTION 'A giver name is required';
  END IF;

  IF COALESCE(p_amount, 0) < 0 THEN
    RAISE EXCEPTION 'Amount cannot be negative';
  END IF;

  -- Resolve the day: explicit pick, else the event's earliest day.
  v_day := COALESCE(
    p_day_id,
    (SELECT id FROM event_days WHERE event_id = p_event_id ORDER BY date, id LIMIT 1)
  );
  IF v_day IS NULL THEN
    RAISE EXCEPTION 'Event has no days';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM event_days WHERE id = v_day AND event_id = p_event_id) THEN
    RAISE EXCEPTION 'Day does not belong to this event';
  END IF;

  INSERT INTO event_gifts (event_id, given_by, amount, method, notes, day_id)
  VALUES (
    p_event_id, btrim(p_given_by), COALESCE(p_amount, 0),
    COALESCE(p_method, 'envelope'), p_notes, v_day
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_gift(
  p_event_id uuid,
  p_id       uuid,
  p_given_by text    DEFAULT NULL,
  p_amount   numeric DEFAULT NULL,
  p_method   text    DEFAULT NULL,
  p_notes    text    DEFAULT NULL,
  p_day_id   uuid    DEFAULT NULL
)
RETURNS event_gifts LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_gift   event_gifts;
  v_day    uuid;
BEGIN
  SELECT * INTO v_gift FROM event_gifts WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Gift not found';
  END IF;

  IF v_gift.event_id != p_event_id THEN
    RAISE EXCEPTION 'Gift does not belong to this event';
  END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Insufficient permission to update gifts';
  END IF;

  IF p_given_by IS NOT NULL AND btrim(p_given_by) = '' THEN
    RAISE EXCEPTION 'A giver name is required';
  END IF;

  IF p_amount IS NOT NULL AND p_amount < 0 THEN
    RAISE EXCEPTION 'Amount cannot be negative';
  END IF;

  -- Re-file the gift onto the chosen day (validated); NULL keeps its current day.
  IF p_day_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM event_days WHERE id = p_day_id AND event_id = p_event_id) THEN
      RAISE EXCEPTION 'Day does not belong to this event';
    END IF;
    v_day := p_day_id;
  ELSE
    v_day := v_gift.day_id;
  END IF;

  UPDATE event_gifts
  SET
    given_by = COALESCE(NULLIF(btrim(p_given_by), ''), given_by),
    amount   = COALESCE(p_amount, amount),
    method   = COALESCE(p_method, method),
    notes    = p_notes,
    day_id   = v_day
  WHERE id = p_id
  RETURNING * INTO v_gift;

  RETURN v_gift;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_gift(p_event_id uuid, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_gift   event_gifts;
BEGIN
  SELECT * INTO v_gift FROM event_gifts WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Gift not found';
  END IF;

  IF v_gift.event_id != p_event_id THEN
    RAISE EXCEPTION 'Gift does not belong to this event';
  END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Insufficient permission to delete gifts';
  END IF;

  DELETE FROM event_gifts WHERE id = p_id;
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
-- DAY CRUD — RPCs  [added migration 20260611000003]
-- create / update / delete event_days after creation, gated on the `timeline`
-- resource (named like the segment RPCs). create seeds a default segment;
-- delete cascades segments + items (FK) and is blocked on the last day. The date
-- span is derived from event_days on read (events_with_dates), so nothing here
-- writes it back.
-- =============================================================================

-- create_day — append a labeled day + its default segment; expand envelope.
CREATE OR REPLACE FUNCTION public.create_day(p_event_id uuid, p_date date, p_label text)
RETURNS event_days LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_day event_days;
BEGIN
  IF NOT is_super_admin_member(p_event_id) THEN
    RAISE EXCEPTION 'Insufficient permission to add days';
  END IF;

  IF p_date IS NULL THEN
    RAISE EXCEPTION 'A date is required';
  END IF;

  IF btrim(COALESCE(p_label, '')) = '' THEN
    RAISE EXCEPTION 'A label is required';
  END IF;

  IF EXISTS (SELECT 1 FROM event_days WHERE event_id = p_event_id AND date = p_date) THEN
    RAISE EXCEPTION 'That day is already on the schedule';
  END IF;

  INSERT INTO event_days (event_id, date, label)
  VALUES (p_event_id, p_date, btrim(p_label))
  RETURNING * INTO v_day;

  INSERT INTO event_segments (event_id, day_id, name, sort_order)
  VALUES (p_event_id, v_day.id, NULL, 0);

  RETURN v_day;
END;
$$;

-- update_day — rename a day. Label is required (NOT NULL); a blank is rejected.
CREATE OR REPLACE FUNCTION public.update_day(p_event_id uuid, p_id uuid, p_label text)
RETURNS event_days LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_day event_days;
BEGIN
  IF NOT is_super_admin_member(p_event_id) THEN
    RAISE EXCEPTION 'Insufficient permission to update days';
  END IF;

  IF btrim(COALESCE(p_label, '')) = '' THEN
    RAISE EXCEPTION 'A label is required';
  END IF;

  UPDATE event_days
  SET label = btrim(p_label)
  WHERE id = p_id AND event_id = p_event_id
  RETURNING * INTO v_day;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Day not found';
  END IF;

  RETURN v_day;
END;
$$;

-- delete_day — remove an empty day. Keeps ≥1 day, and refuses a day that still
-- has schedule items (the caller must clear them from the timeline first).
CREATE OR REPLACE FUNCTION public.delete_day(p_event_id uuid, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count    integer;
  v_items    integer;
  v_expenses integer;
  v_gifts    integer;
BEGIN
  IF NOT is_super_admin_member(p_event_id) THEN
    RAISE EXCEPTION 'Insufficient permission to delete days';
  END IF;

  SELECT count(*) INTO v_count FROM event_days WHERE event_id = p_event_id;
  IF v_count <= 1 THEN
    RAISE EXCEPTION 'An event must keep at least one day';
  END IF;

  -- Items attach via segments (event_timelines.segment_id -> event_segments
  -- .day_id). Count items, not segments — every day has a default segment.
  SELECT count(*) INTO v_items
  FROM event_timelines t
  JOIN event_segments s ON s.id = t.segment_id
  WHERE s.day_id = p_id AND t.event_id = p_event_id;
  IF v_items > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % schedule item(s) before deleting it', v_items;
  END IF;

  -- Expenses attach via the day's budget bucket (event_expenses.budget_id ->
  -- event_budget.day_id). The bucket -> expense FK is RESTRICT; count here so
  -- it reads as a message rather than a raw FK violation.
  SELECT count(*) INTO v_expenses
  FROM event_expenses e
  JOIN event_budget b ON b.id = e.budget_id
  WHERE b.day_id = p_id AND e.event_id = p_event_id;
  IF v_expenses > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % expense(s) before deleting it', v_expenses;
  END IF;

  -- Gifts attach directly via event_gifts.day_id (RESTRICT FK).
  SELECT count(*) INTO v_gifts
  FROM event_gifts WHERE day_id = p_id AND event_id = p_event_id;
  IF v_gifts > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % gift(s) before deleting it', v_gifts;
  END IF;

  DELETE FROM event_days WHERE id = p_id AND event_id = p_event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Day not found';
  END IF;
END;
$$;


-- =============================================================================
-- SLUG RESERVATION — RPCs  [added migration 20260611000002]
-- Hold a slug for a user mid-wizard. is_slug_taken drives the availability
-- check; reserve/release manage the hold. 30-min sliding TTL, lazy expiry.
-- =============================================================================

-- is_slug_taken — true if ANY event (incl. soft-deleted, which keep their slug
-- and may be reinstated) OR another user's active reservation holds the slug.
-- The caller's own reservation never blocks them. NULL expiry = permanent.
CREATE OR REPLACE FUNCTION public.is_slug_taken(p_slug text)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events WHERE slug = p_slug
  ) OR EXISTS (
    SELECT 1 FROM public.slug_reservations
    WHERE slug = p_slug
      AND (expires_at IS NULL OR expires_at > now())
      AND user_id IS DISTINCT FROM auth.uid()
  );
$$;

-- reserve_slug — claim (or refresh) a slug for the caller. Sliding: re-reserving
-- your own active slug bumps the TTL ("Keep it"); a different slug releases the
-- prior hold. Single "already taken" message either way, so the holder stays anon.
CREATE OR REPLACE FUNCTION public.reserve_slug(p_slug text)
RETURNS timestamptz LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user uuid        := auth.uid();
  v_exp  timestamptz := now() + interval '30 minutes';
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to reserve a URL';
  END IF;

  IF p_slug !~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$' THEN
    RAISE EXCEPTION 'Invalid URL slug';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.events WHERE slug = p_slug
  ) OR EXISTS (
    SELECT 1 FROM public.slug_reservations
    WHERE slug = p_slug AND user_id <> v_user
      AND (expires_at IS NULL OR expires_at > now())
  ) THEN
    RAISE EXCEPTION 'This URL is already taken';
  END IF;

  DELETE FROM public.slug_reservations
  WHERE user_id = v_user AND slug <> p_slug AND expires_at IS NOT NULL;

  INSERT INTO public.slug_reservations (slug, user_id, expires_at)
  VALUES (p_slug, v_user, v_exp)
  ON CONFLICT (slug) DO UPDATE
    SET user_id = excluded.user_id, expires_at = excluded.expires_at
    WHERE slug_reservations.user_id = v_user
       OR (slug_reservations.expires_at IS NOT NULL
           AND slug_reservations.expires_at <= now());

  RETURN v_exp;
END;
$$;

-- release_slug — drop the caller's reservation(s) on leaving the wizard.
CREATE OR REPLACE FUNCTION public.release_slug()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  DELETE FROM public.slug_reservations WHERE user_id = auth.uid();
$$;

-- cleanup_expired_slug_reservations — housekeeping purge, run every 30 min by
-- pg_cron (migration 20260611000004). Lazy expiry already keeps checks correct;
-- this only reclaims dead rows. Permanent (NULL-expiry) rows are never deleted.
CREATE OR REPLACE FUNCTION public.cleanup_expired_slug_reservations()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  DELETE FROM public.slug_reservations
  WHERE expires_at IS NOT NULL AND expires_at < now();
$$;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_slug_reservations() FROM PUBLIC, anon, authenticated;


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

REVOKE EXECUTE ON FUNCTION public.auto_attach_table_triggers() FROM PUBLIC, anon, authenticated;

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
