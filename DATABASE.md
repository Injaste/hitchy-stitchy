# Hitchy Stitchy — Database Reference

> Source of truth for all Supabase tables, functions, triggers, policies, and permissions.
> Update this file whenever schema changes are made.
> Last updated: registration feature (event_templates, event_invitation, event_themes).

---

## Enums

| Enum                  | Values                                         |
| --------------------- | ---------------------------------------------- |
| `event_role_category` | `root`, `admin`, `couple_attendant`, `general` |
| `event_rsvp_mode`     | `public`, `private`, `both`                    |
| `event_rsvp_status`   | `pending`, `confirmed`, `cancelled`            |
| `event_task_status`   | `todo`, `in_progress`, `done`                  |
| `event_task_priority` | `low`, `medium`, `high`                        |

---

## Tables

### `events`

Core event record. One per wedding. Only table with soft delete.

| Column       | Type          | Notes                                       |
| ------------ | ------------- | ------------------------------------------- |
| `id`         | `uuid`        | PK                                          |
| `slug`       | `text`        | Unique, immutable                           |
| `name`       | `text`        |                                             |
| `date_start` | `date`        | No timezone — internal/admin use only       |
| `date_end`   | `date`        | No timezone — internal/admin use only       |
| `created_by` | `uuid`        | FK → `event_members.id`, immutable once set |
| `deleted_at` | `timestamptz` | Soft delete, immutable once set             |
| `created_at` | `timestamptz` | Immutable                                   |
| `updated_at` | `timestamptz` | Auto                                        |

> `date_start` / `date_end` are for internal administrative purposes only. Public-facing event dates live in `event_invitation`.

---

### `event_roles`

Roles scoped per event. Each member has one role. Root role row is fully immutable.

| Column        | Type                  | Notes                                                |
| ------------- | --------------------- | ---------------------------------------------------- |
| `id`          | `uuid`                | PK                                                   |
| `event_id`    | `uuid`                | FK → `events.id`, cascade delete                     |
| `name`        | `text`                | Unique per event                                     |
| `short_name`  | `text`                | Auto-derived from `name` if not provided via trigger |
| `category`    | `event_role_category` | Default `general`                                    |
| `description` | `text`                | Nullable                                             |
| `created_at`  | `timestamptz`         | Immutable                                            |
| `updated_at`  | `timestamptz`         | Auto                                                 |

**Unique:** `(event_id, name)`

---

### `event_members`

All people associated with an event. Only table referencing `auth.users`.

| Column         | Type          | Notes                                               |
| -------------- | ------------- | --------------------------------------------------- |
| `id`           | `uuid`        | PK                                                  |
| `event_id`     | `uuid`        | FK → `events.id`, cascade delete                    |
| `user_id`      | `uuid`        | FK → `auth.users.id`, nullable until claimed        |
| `role_id`      | `uuid`        | FK → `event_roles.id`, nullable, set null on delete |
| `email`        | `text`        | Used for invite/self-claim flow                     |
| `display_name` | `text`        |                                                     |
| `is_frozen`    | `boolean`     | Default `false` — freezes event access              |
| `invited_at`   | `timestamptz` | Immutable                                           |
| `joined_at`    | `timestamptz` | Immutable once set                                  |
| `rejected_at`  | `timestamptz` | Immutable once set                                  |
| `created_at`   | `timestamptz` | Immutable                                           |
| `updated_at`   | `timestamptz` | Auto                                                |

---

### `event_role_permissions`

Permission matrix. Drives all RLS via `has_event_permission()`.
`root` has no rows — function shortcuts automatically.
Only insert rows that grant access — missing row = no access.

| Column       | Type                  | Notes                                |
| ------------ | --------------------- | ------------------------------------ |
| `id`         | `uuid`                | PK                                   |
| `category`   | `event_role_category` |                                      |
| `resource`   | `text`                | e.g. `events`, `timeline`, `members` |
| `can_create` | `boolean`             | Default `false`                      |
| `can_read`   | `boolean`             | Default `false`                      |
| `can_update` | `boolean`             | Default `false`                      |
| `can_delete` | `boolean`             | Default `false`                      |
| `created_at` | `timestamptz`         | Immutable                            |
| `updated_at` | `timestamptz`         | Auto                                 |

**Unique:** `(category, resource)`

**Seed data:**

| category           | resource        | C   | R   | U   | D   |
| ------------------ | --------------- | --- | --- | --- | --- |
| `admin`            | `events`        |     | ✓   | ✓   |     |
| `couple_attendant` | `events`        |     | ✓   |     |     |
| `general`          | `events`        |     | ✓   |     |     |
| `admin`            | `members`       | ✓   | ✓   | ✓   | ✓   |
| `admin`            | `roles`         | ✓   | ✓   | ✓   | ✓   |
| `admin`            | `timeline`      | ✓   | ✓   | ✓   | ✓   |
| `couple_attendant` | `timeline`      | ✓   | ✓   | ✓   | ✓   |
| `general`          | `timeline`      |     | ✓   |     |     |
| `admin`            | `tasks`         | ✓   | ✓   | ✓   | ✓   |
| `couple_attendant` | `tasks`         | ✓   | ✓   | ✓   | ✓   |
| `general`          | `tasks`         | ✓   | ✓   |     |     |
| `admin`            | `rsvp`          | ✓   | ✓   | ✓   | ✓   |
| `admin`            | `announcements` | ✓   | ✓   | ✓   | ✓   |
| `couple_attendant` | `announcements` | ✓   | ✓   | ✓   | ✓   |
| `admin`            | `vendors`       | ✓   | ✓   | ✓   | ✓   |
| `admin`            | `invitation`    |     | ✓   | ✓   |     |
| `admin`            | `pages`         | ✓   | ✓   | ✓   | ✓   |

> `general` on `tasks` — C and R from this table. U and D on own rows via ownership RLS policy.
> All other resources — `general` gets read via `is_event_member` on select policies, no explicit row needed.
> `invitation` — no create/delete from client. Row lifecycle owned by `create_event` RPC and cascade.
> `pages` — admin full CRUD. Anon SELECT allowed (invitation page needs the published page).

---

### `event_timelines`

Individual schedule items. Flat — no parent day table.

| Column       | Type          | Notes                                            |
| ------------ | ------------- | ------------------------------------------------ |
| `id`         | `uuid`        | PK                                               |
| `event_id`   | `uuid`        | FK → `events.id`, cascade delete                 |
| `day`        | `date`        | No timezone — groups items by date               |
| `label`      | `text`        | Nullable, e.g. "Nikah", "Sanding"                |
| `time_start` | `time`        | No timezone                                      |
| `time_end`   | `time`        | Nullable, no timezone                            |
| `title`      | `text`        |                                                  |
| `details`    | `text`        | Nullable — markdown supported                    |
| `assignees`  | `uuid[]`      | Array of `event_roles.id`, app-level only, no FK |
| `created_at` | `timestamptz` | Immutable                                        |
| `updated_at` | `timestamptz` | Auto                                             |

**Grouping order:** `day ASC → time_start ASC → label ASC (nulls last) → created_at ASC`

---

### `event_tasks`

Checklist items. Supports future subtasks via `parent_id`. Ownership tracked via `created_by`.

| Column       | Type                  | Notes                                              |
| ------------ | --------------------- | -------------------------------------------------- |
| `id`         | `uuid`                | PK                                                 |
| `event_id`   | `uuid`                | FK → `events.id`, cascade delete                   |
| `parent_id`  | `uuid`                | FK → `event_tasks.id`, nullable, cascade delete    |
| `created_by` | `uuid`                | FK → `event_members.id`, auto-set via trigger      |
| `title`      | `text`                |                                                    |
| `details`    | `text`                | Nullable                                           |
| `status`     | `event_task_status`   | Default `todo`                                     |
| `priority`   | `event_task_priority` | Nullable                                           |
| `assignees`  | `uuid[]`              | Array of `event_members.id`, app-level only, no FK |
| `due_at`     | `date`                | Nullable                                           |
| `start_at`   | `date`                | Nullable                                           |
| `created_at` | `timestamptz`         | Immutable                                          |
| `updated_at` | `timestamptz`         | Auto                                               |

---

### `event_rsvps`

Guest RSVP submissions. One per phone per event.

| Column         | Type                | Notes                                                               |
| -------------- | ------------------- | ------------------------------------------------------------------- |
| `id`           | `uuid`              | PK                                                                  |
| `event_id`     | `uuid`              | FK → `events.id`, cascade delete                                    |
| `name`         | `text`              |                                                                     |
| `phone`        | `text`              |                                                                     |
| `guest_count`  | `int`               | Default `1`                                                         |
| `message`      | `text`              | Nullable                                                            |
| `status`       | `event_rsvp_status` | Default `pending`                                                   |
| `source`       | `text`              | `'pool'` (admin pre-added) or `'public'` (self-submitted)           |
| `cancel_token` | `uuid`              | Default `gen_random_uuid()` — used with phone for self-cancellation |
| `created_at`   | `timestamptz`       | Immutable                                                           |
| `updated_at`   | `timestamptz`       | Auto                                                                |

**Unique:** `(event_id, phone)`

---

### `event_announcements`

Admin/attendant broadcasts. Auto-expires 10 days after `event.date_end`. `created_by` auto-set via trigger.

| Column         | Type          | Notes                                              |
| -------------- | ------------- | -------------------------------------------------- |
| `id`           | `uuid`        | PK                                                 |
| `event_id`     | `uuid`        | FK → `events.id`, cascade delete                   |
| `created_by`   | `uuid`        | FK → `event_members.id`, auto-set via trigger      |
| `title`        | `text`        |                                                    |
| `body`         | `text`        |                                                    |
| `target_roles` | `text[]`      | Nullable — null means everyone. Stores role names. |
| `expires_at`   | `timestamptz` | Auto-set via trigger to `event.date_end + 10 days` |
| `created_at`   | `timestamptz` | Immutable                                          |
| `updated_at`   | `timestamptz` | Auto                                               |

---

### `event_announcement_reads`

Read receipts. Append-only.

| Column            | Type          | Notes                                         |
| ----------------- | ------------- | --------------------------------------------- |
| `id`              | `uuid`        | PK                                            |
| `event_id`        | `uuid`        | FK → `events.id`, cascade delete              |
| `announcement_id` | `uuid`        | FK → `event_announcements.id`, cascade delete |
| `member_id`       | `uuid`        | FK → `event_members.id`, cascade delete       |
| `read_at`         | `timestamptz` | Default `now()`                               |
| `created_at`      | `timestamptz` | Immutable                                     |
| `updated_at`      | `timestamptz` | Auto                                          |

**Unique:** `(announcement_id, member_id)`

---

### `event_vendors`

Wedding vendor contacts. Admin-managed.

| Column       | Type          | Notes                            |
| ------------ | ------------- | -------------------------------- |
| `id`         | `uuid`        | PK                               |
| `event_id`   | `uuid`        | FK → `events.id`, cascade delete |
| `name`       | `text`        |                                  |
| `category`   | `text`        | Nullable, free-form              |
| `phone`      | `text`        | Nullable                         |
| `email`      | `text`        | Nullable                         |
| `price`      | `numeric`     | Nullable                         |
| `status`     | `text`        | Nullable, free-form              |
| `notes`      | `text`        | Nullable                         |
| `created_at` | `timestamptz` | Immutable                        |
| `updated_at` | `timestamptz` | Auto                             |

---

### `event_live_logs`

Operational logs. Append-only. Auto-expires 10 days after `event.date_end`.
`member_snapshot` auto-derived and validated via trigger — cannot be spoofed.

| Column            | Type          | Notes                                              |
| ----------------- | ------------- | -------------------------------------------------- |
| `id`              | `uuid`        | PK                                                 |
| `event_id`        | `uuid`        | FK → `events.id`, cascade delete                   |
| `member_snapshot` | `text`        | Auto-set via trigger e.g. "Ali - Coordinator"      |
| `message`         | `text`        |                                                    |
| `expires_at`      | `timestamptz` | Auto-set via trigger to `event.date_end + 10 days` |
| `created_at`      | `timestamptz` | Immutable                                          |
| `updated_at`      | `timestamptz` | Auto                                               |

No UPDATE policy — append-only.

---

### `event_member_notification_prefs`

Per-member notification preferences. Auto-created via trigger on member insert.

| Column        | Type          | Notes                                           |
| ------------- | ------------- | ----------------------------------------------- |
| `id`          | `uuid`        | PK                                              |
| `member_id`   | `uuid`        | FK → `event_members.id`, cascade delete, unique |
| `preferences` | `jsonb`       | Default `{}` — schemaless, frontend-driven      |
| `created_at`  | `timestamptz` | Immutable                                       |
| `updated_at`  | `timestamptz` | Auto                                            |

---

### `event_templates`

Read-only design library. Managed by superuser only — no client mutations.
Each theme defines a visual style. Its `config` holds default visual values for that theme.

| Column        | Type          | Notes                                              |
| ------------- | ------------- | -------------------------------------------------- |
| `id`          | `uuid`        | PK                                                 |
| `name`        | `text`        | e.g. `"Classic Malay"`                             |
| `slug`        | `text`        | Unique — used by frontend to render the component  |
| `description` | `text`        | Nullable                                           |
| `config`      | `jsonb`       | Default `{}` — default visual config for the theme |
| `is_active`   | `boolean`     | Default `true`                                     |
| `created_at`  | `timestamptz` | Immutable                                          |
| `updated_at`  | `timestamptz` | Auto                                               |

**Unique:** `(slug)`

---

### `event_invitation`

Public-facing invitation content. One per event. Created by `create_event` RPC.
Holds all content guests see on the invitation page plus RSVP configuration.

| Column                | Type              | Notes                                                    |
| --------------------- | ----------------- | -------------------------------------------------------- |
| `id`                  | `uuid`            | PK                                                       |
| `event_id`            | `uuid`            | FK → `events.id`, cascade delete, unique, immutable      |
| `groom_name`          | `text`            | Nullable — e.g. `"Danish"`                               |
| `bride_name`          | `text`            | Nullable — e.g. `"Nadia"`                                |
| `event_date`          | `date`            | Nullable — public-facing ceremony date, no tz            |
| `event_time_start`    | `text`            | Nullable — display string e.g. `"11:00 AM"`              |
| `event_time_end`      | `text`            | Nullable                                                 |
| `venue_name`          | `text`            | Nullable                                                 |
| `venue_address`       | `text`            | Nullable                                                 |
| `venue_map_embed_url` | `text`            | Nullable                                                 |
| `venue_map_link`      | `text`            | Nullable                                                 |
| `rsvp_mode`           | `event_rsvp_mode` | Default `'public'`                                       |
| `rsvp_deadline`       | `date`            | Nullable — null means no deadline, no tz                 |
| `config`              | `jsonb`           | Default (see below) — rsvp form schema + optional fields |
| `created_at`          | `timestamptz`     | Immutable                                                |
| `updated_at`          | `timestamptz`     | Auto                                                     |

**`config` default:**

```json
{
  "rsvp": {
    "fields": {
      "name": { "visible": true, "required": true },
      "phone": { "visible": true, "required": true },
      "guestCount": { "visible": true, "required": true, "min": 1, "max": 10 },
      "message": { "visible": false, "required": false }
    },
    "confirmation_message": "We look forward to celebrating with you!"
  }
}
```

**`config.appearance` — optional, absent by default, written by frontend when set:**

```json
{
  "appearance": {
    "greeting": null,
    "quote": null,
    "quote_source": null,
    "section_title": null,
    "invitation_body": null,
    "attire": null,
    "blessings_name": null,
    "blessings_label": null
  }
}
```

> `rsvp_deadline` — null means no deadline. No separate enabled flag needed; nullability is the gate.

---

### `event_themes`

User-created invitation pages. Many per event, one published at a time.
Each page is a customised instance of an `event_templates` design.

| Column         | Type          | Notes                                                        |
| -------------- | ------------- | ------------------------------------------------------------ |
| `id`           | `uuid`        | PK                                                           |
| `event_id`     | `uuid`        | FK → `events.id`, cascade delete, immutable                  |
| `template_id`  | `uuid`        | FK → `event_templates.id`, set null on delete, nullable      |
| `name`         | `text`        | Default `'My Invitation'` — user label e.g. "Nikah Page"     |
| `is_published` | `boolean`     | Default `false` — only one per event can be true             |
| `config`       | `jsonb`       | Default `{}` — visual/theme overrides copied from theme seed |
| `created_at`   | `timestamptz` | Immutable                                                    |
| `updated_at`   | `timestamptz` | Auto                                                         |

> Partial unique index enforces one published page per event at DB level.
> Pages are created by the user when selecting a theme — not seeded by `create_event`.
> `template_id` set null if theme is deleted — page config is preserved.

---

## Views

### `event_slugs`

Public read-only projection of `events`. Used by invitation page. No auth required.
`security_invoker = false` — bypasses RLS so anon can read.

```sql
create or replace view event_slugs
  with (security_invoker = false)
as
  select id, slug, name, date_start, date_end
  from events
  where deleted_at is null;

grant select on event_slugs to anon;
```

**Invitation page read chain:**

```
event_slugs (slug → event_id, anon)
  → event_invitation (event_id, anon) — content + rsvp config
  → event_themes WHERE is_published = true (event_id, anon) — visual layer
      → event_templates (template_id, authenticated) — slug used to render component
```

---

## Functions

### Auth & Permission

| Function                | Args                                              | Returns   | Security        | Purpose                                                                                 |
| ----------------------- | ------------------------------------------------- | --------- | --------------- | --------------------------------------------------------------------------------------- |
| `is_event_active`       | `p_event_id uuid`                                 | `boolean` | definer, stable | Is event not soft-deleted? Reused by all auth functions.                                |
| `is_event_member`       | `p_event_id uuid`                                 | `boolean` | definer, stable | Is authed user an active non-frozen member? Calls `is_event_active`.                    |
| `has_event_permission`  | `p_event_id uuid, p_resource text, p_action text` | `boolean` | definer, stable | Does authed user have this action? Root shortcuts. Calls `is_event_active`.             |
| `get_current_member_id` | `p_event_id uuid`                                 | `uuid`    | definer, stable | Returns `event_members.id` for authed user. Null if not found. Calls `is_event_active`. |
| `get_member_snapshot`   | `p_event_id uuid`                                 | `text`    | definer, stable | Returns `"display_name - role_name"` for authed user. Used by `set_member_snapshot`.    |

---

### Business Logic (RPC)

| Function               | Args                                                                                       | Returns                            | Security        | Purpose                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------- | --------------- | ------------------------------------------------------------------------- |
| `create_event`         | `p_slug, p_name, p_date_start, p_date_end, p_display_name, p_role_name, p_role_short_name` | `TABLE(event_id, member_id, slug)` | definer         | Single transaction: creates event + root role + member + event_invitation |
| `soft_delete_event`    | `p_event_id uuid`                                                                          | `void`                             | definer         | Sets `deleted_at = now()`, root only                                      |
| `create_timeline_item` | `p_event_id, p_day, p_label, p_time_start, p_time_end, p_title, p_details, p_assignees`    | `event_timelines`                  | definer         | Inserts timeline item, validates event is active                          |
| `cancel_rsvp`          | `p_event_id uuid, p_phone text, p_cancel_token uuid`                                       | `void`                             | definer         | Anon guest self-cancellation via token + phone                            |
| `get_rsvp`             | `p_event_id uuid, p_phone text`                                                            | `event_rsvps`                      | definer, stable | Anon guest reads own RSVP by phone                                        |

`cancel_rsvp` and `get_rsvp` granted to `anon`.

---

### Trigger Functions

| Function                             | Returns   | Security | Purpose                                                                                                |
| ------------------------------------ | --------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `touch_updated_at`                   | `trigger` | —        | Sets `updated_at = now()` on every UPDATE                                                              |
| `enforce_immutable_columns`          | `trigger` | —        | Blocks mutation of named columns — pass as variadic args                                               |
| `enforce_immutable_columns_once_set` | `trigger` | —        | Blocks mutation once column has a non-null value                                                       |
| `derive_role_short_name`             | `trigger` | —        | Sets `short_name = upper(left(name, 2))` if not provided on INSERT                                     |
| `set_expires_at`                     | `trigger` | —        | Sets `expires_at = event.date_end + 10 days` on INSERT. Raises exception if event not found.           |
| `set_created_by`                     | `trigger` | definer  | Sets `created_by = get_current_member_id(event_id)` on INSERT. Raises exception if member not found.   |
| `set_member_snapshot`                | `trigger` | definer  | Sets `member_snapshot = "display_name - role_name"` on INSERT. Raises exception if member has no role. |
| `initialize_member_rows`             | `trigger` | —        | After `event_members` INSERT: creates `event_member_notification_prefs` row                            |
| `prevent_root_role_mutation`         | `trigger` | —        | Blocks UPDATE and DELETE on root role rows                                                             |

---

### DDL Event Triggers

| Function                     | Returns         | Purpose                                                                                                                            |
| ---------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `auto_attach_table_triggers` | `event_trigger` | Auto-attaches `touch_updated_at` and `immutable_created_at` triggers to new tables that have `updated_at` and `created_at` columns |

---

## Triggers

### `events`

| Trigger                       | Event  | Timing     | Function                                           |
| ----------------------------- | ------ | ---------- | -------------------------------------------------- |
| `touch_updated_at_events`     | UPDATE | BEFORE ROW | `touch_updated_at()`                               |
| `immutable_events_created_at` | UPDATE | BEFORE ROW | `enforce_immutable_columns('created_at')`          |
| `immutable_events_slug`       | UPDATE | BEFORE ROW | `enforce_immutable_columns('slug')`                |
| `immutable_events_created_by` | UPDATE | BEFORE ROW | `enforce_immutable_columns_once_set('created_by')` |
| `immutable_events_deleted_at` | UPDATE | BEFORE ROW | `enforce_immutable_columns_once_set('deleted_at')` |

### `event_roles`

| Trigger                            | Event  | Timing     | Function                                  |
| ---------------------------------- | ------ | ---------- | ----------------------------------------- |
| `derive_role_short_name`           | INSERT | BEFORE ROW | `derive_role_short_name()`                |
| `immutable_root_role`              | UPDATE | BEFORE ROW | `prevent_root_role_mutation()`            |
| `no_delete_root_role`              | DELETE | BEFORE ROW | `prevent_root_role_mutation()`            |
| `touch_updated_at_event_roles`     | UPDATE | BEFORE ROW | `touch_updated_at()`                      |
| `immutable_event_roles_created_at` | UPDATE | BEFORE ROW | `enforce_immutable_columns('created_at')` |

### `event_members`

| Trigger                               | Event  | Timing     | Function                                            |
| ------------------------------------- | ------ | ---------- | --------------------------------------------------- |
| `initialize_member_rows`              | INSERT | AFTER ROW  | `initialize_member_rows()`                          |
| `touch_updated_at_event_members`      | UPDATE | BEFORE ROW | `touch_updated_at()`                                |
| `immutable_event_members_created_at`  | UPDATE | BEFORE ROW | `enforce_immutable_columns('created_at')`           |
| `immutable_event_members_invited_at`  | UPDATE | BEFORE ROW | `enforce_immutable_columns('invited_at')`           |
| `immutable_event_members_joined_at`   | UPDATE | BEFORE ROW | `enforce_immutable_columns_once_set('joined_at')`   |
| `immutable_event_members_rejected_at` | UPDATE | BEFORE ROW | `enforce_immutable_columns_once_set('rejected_at')` |

### `event_role_permissions`

| Trigger                                       | Event  | Timing     | Function                                  |
| --------------------------------------------- | ------ | ---------- | ----------------------------------------- |
| `touch_updated_at_event_role_permissions`     | UPDATE | BEFORE ROW | `touch_updated_at()`                      |
| `immutable_event_role_permissions_created_at` | UPDATE | BEFORE ROW | `enforce_immutable_columns('created_at')` |

### `event_timelines`

| Trigger                                | Event  | Timing     | Function                                  |
| -------------------------------------- | ------ | ---------- | ----------------------------------------- |
| `touch_updated_at_event_timelines`     | UPDATE | BEFORE ROW | `touch_updated_at()`                      |
| `immutable_event_timelines_created_at` | UPDATE | BEFORE ROW | `enforce_immutable_columns('created_at')` |

### `event_tasks`

| Trigger                            | Event  | Timing     | Function                                  |
| ---------------------------------- | ------ | ---------- | ----------------------------------------- |
| `set_created_by_event_tasks`       | INSERT | BEFORE ROW | `set_created_by()`                        |
| `touch_updated_at_event_tasks`     | UPDATE | BEFORE ROW | `touch_updated_at()`                      |
| `immutable_event_tasks_created_at` | UPDATE | BEFORE ROW | `enforce_immutable_columns('created_at')` |

### `event_rsvps`

| Trigger                            | Event  | Timing     | Function                                  |
| ---------------------------------- | ------ | ---------- | ----------------------------------------- |
| `touch_updated_at_event_rsvps`     | UPDATE | BEFORE ROW | `touch_updated_at()`                      |
| `immutable_event_rsvps_created_at` | UPDATE | BEFORE ROW | `enforce_immutable_columns('created_at')` |

### `event_announcements`

| Trigger                                    | Event  | Timing     | Function                                  |
| ------------------------------------------ | ------ | ---------- | ----------------------------------------- |
| `set_created_by_event_announcements`       | INSERT | BEFORE ROW | `set_created_by()`                        |
| `set_expires_at_announcements`             | INSERT | BEFORE ROW | `set_expires_at()`                        |
| `touch_updated_at_event_announcements`     | UPDATE | BEFORE ROW | `touch_updated_at()`                      |
| `immutable_event_announcements_created_at` | UPDATE | BEFORE ROW | `enforce_immutable_columns('created_at')` |

### `event_announcement_reads`

| Trigger                                         | Event  | Timing     | Function                                  |
| ----------------------------------------------- | ------ | ---------- | ----------------------------------------- |
| `touch_updated_at_event_announcement_reads`     | UPDATE | BEFORE ROW | `touch_updated_at()`                      |
| `immutable_event_announcement_reads_created_at` | UPDATE | BEFORE ROW | `enforce_immutable_columns('created_at')` |

### `event_vendors`

| Trigger                              | Event  | Timing     | Function                                  |
| ------------------------------------ | ------ | ---------- | ----------------------------------------- |
| `touch_updated_at_event_vendors`     | UPDATE | BEFORE ROW | `touch_updated_at()`                      |
| `immutable_event_vendors_created_at` | UPDATE | BEFORE ROW | `enforce_immutable_columns('created_at')` |

### `event_live_logs`

| Trigger                                | Event  | Timing     | Function                                  |
| -------------------------------------- | ------ | ---------- | ----------------------------------------- |
| `set_member_snapshot_event_live_logs`  | INSERT | BEFORE ROW | `set_member_snapshot()`                   |
| `set_expires_at_live_logs`             | INSERT | BEFORE ROW | `set_expires_at()`                        |
| `touch_updated_at_event_live_logs`     | UPDATE | BEFORE ROW | `touch_updated_at()`                      |
| `immutable_event_live_logs_created_at` | UPDATE | BEFORE ROW | `enforce_immutable_columns('created_at')` |

### `event_member_notification_prefs`

| Trigger                                                | Event  | Timing     | Function                                  |
| ------------------------------------------------------ | ------ | ---------- | ----------------------------------------- |
| `touch_updated_at_event_member_notification_prefs`     | UPDATE | BEFORE ROW | `touch_updated_at()`                      |
| `immutable_event_member_notification_prefs_created_at` | UPDATE | BEFORE ROW | `enforce_immutable_columns('created_at')` |

### `event_templates`

Auto-attached by `auto_attach_table_triggers`. No manual triggers needed.

| Trigger                                | Event  | Timing     | Function                                  |
| -------------------------------------- | ------ | ---------- | ----------------------------------------- |
| `touch_updated_at_event_templates`     | UPDATE | BEFORE ROW | `touch_updated_at()`                      |
| `immutable_event_templates_created_at` | UPDATE | BEFORE ROW | `enforce_immutable_columns('created_at')` |

### `event_invitation`

| Trigger                                 | Event  | Timing     | Function                                  |
| --------------------------------------- | ------ | ---------- | ----------------------------------------- |
| `touch_updated_at_event_invitation`     | UPDATE | BEFORE ROW | `touch_updated_at()`                      |
| `immutable_event_invitation_created_at` | UPDATE | BEFORE ROW | `enforce_immutable_columns('created_at')` |
| `immutable_event_invitation_event_id`   | UPDATE | BEFORE ROW | `enforce_immutable_columns('event_id')`   |

### `event_themes`

| Trigger                             | Event  | Timing     | Function                                  |
| ----------------------------------- | ------ | ---------- | ----------------------------------------- |
| `touch_updated_at_event_themes`     | UPDATE | BEFORE ROW | `touch_updated_at()`                      |
| `immutable_event_themes_created_at` | UPDATE | BEFORE ROW | `enforce_immutable_columns('created_at')` |
| `immutable_event_themes_event_id`   | UPDATE | BEFORE ROW | `enforce_immutable_columns('event_id')`   |

---

## Policies

| Table                             | SELECT                                        | INSERT                                                      | UPDATE                                                   | DELETE                                                 |
| --------------------------------- | --------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| `events`                          | `is_event_member(id)` + `deleted_at IS NULL`  | via RPC only                                                | `has_event_permission(id, 'events', 'update')`           | none                                                   |
| `event_roles`                     | `is_event_member(event_id)`                   | `has_event_permission(event_id, 'roles', 'create')`         | `has_event_permission(event_id, 'roles', 'update')`      | `has_event_permission(event_id, 'roles', 'delete')`    |
| `event_members`                   | `is_event_member(event_id)`                   | `has_event_permission(event_id, 'members', 'create')`       | permission + root/admin distinction + self-claim         | permission + root/admin distinction                    |
| `event_role_permissions`          | `authenticated` read all                      | none                                                        | none                                                     | none                                                   |
| `event_timelines`                 | `is_event_member(event_id)`                   | `has_event_permission(event_id, 'timeline', 'create')`      | `has_event_permission(event_id, 'timeline', 'update')`   | `has_event_permission(event_id, 'timeline', 'delete')` |
| `event_tasks`                     | `is_event_member(event_id)`                   | `has_event_permission(event_id, 'tasks', 'create')`         | permission OR own (`created_by`)                         | permission OR own (`created_by`)                       |
| `event_rsvps`                     | `is_event_member(event_id)`                   | anon + authenticated, event active check                    | `has_event_permission(event_id, 'rsvp', 'update')`       | `has_event_permission(event_id, 'rsvp', 'delete')`     |
| `event_announcements`             | `is_event_member` + target_roles check        | `has_event_permission(event_id, 'announcements', 'create')` | admin permission OR own                                  | admin permission OR own                                |
| `event_announcement_reads`        | `member_id = get_current_member_id(event_id)` | `member_id = get_current_member_id(event_id)`               | none                                                     | none                                                   |
| `event_vendors`                   | `is_event_member(event_id)`                   | `has_event_permission(event_id, 'vendors', 'create')`       | `has_event_permission(event_id, 'vendors', 'update')`    | `has_event_permission(event_id, 'vendors', 'delete')`  |
| `event_live_logs`                 | `is_event_member(event_id)`                   | `is_event_member(event_id)`                                 | none                                                     | none                                                   |
| `event_member_notification_prefs` | self only via `get_current_member_id`         | via trigger                                                 | self only via `get_current_member_id`                    | none                                                   |
| `event_templates`                 | `authenticated` only, `is_active = true`      | none (superuser only)                                       | none (superuser only)                                    | none (superuser only)                                  |
| `event_invitation`                | `anon` + `authenticated`                      | via RPC only                                                | `has_event_permission(event_id, 'invitation', 'update')` | none                                                   |
| `event_themes`                    | `anon` + `authenticated`                      | `has_event_permission(event_id, 'pages', 'create')`         | `has_event_permission(event_id, 'pages', 'update')`      | `has_event_permission(event_id, 'pages', 'delete')`    |
| `event_slugs` (view)              | public anon                                   | —                                                           | —                                                        | —                                                      |
| `events`                          | `is_event_member(id)`                         | via RPC only                                                | `has_event_permission(id, 'events', 'update')`           | none                                                   |
| `event_members`                   | `is_event_member(event_id)`                   | via RPC only                                                | via RPC only                                             | `has_event_permission(event_id, 'members', 'delete')`  |

---

## Indexes

| Table                             | Index                           | Type           |
| --------------------------------- | ------------------------------- | -------------- |
| `events`                          | `(slug)`                        | unique         |
| `event_roles`                     | `(event_id)`                    | perf           |
| `event_roles`                     | `(event_id, name)`              | unique         |
| `event_role_permissions`          | `(category, resource)`          | unique         |
| `event_members`                   | `(event_id)`                    | perf           |
| `event_members`                   | `(user_id)`                     | perf           |
| `event_members`                   | `(event_id, user_id)`           | perf           |
| `event_timelines`                 | `(event_id)`                    | perf           |
| `event_timelines`                 | `(event_id, day, time_start)`   | perf           |
| `event_tasks`                     | `(event_id)`                    | perf           |
| `event_tasks`                     | `(event_id, status)`            | perf           |
| `event_rsvps`                     | `(event_id)`                    | perf           |
| `event_rsvps`                     | `(event_id, status)`            | perf           |
| `event_rsvps`                     | `(event_id, phone)`             | unique         |
| `event_announcements`             | `(event_id)`                    | perf           |
| `event_announcements`             | `(expires_at)`                  | perf           |
| `event_announcement_reads`        | `(announcement_id)`             | perf           |
| `event_announcement_reads`        | `(member_id)`                   | perf           |
| `event_announcement_reads`        | `(event_id)`                    | perf           |
| `event_announcement_reads`        | `(announcement_id, member_id)`  | unique         |
| `event_vendors`                   | `(event_id)`                    | perf           |
| `event_live_logs`                 | `(event_id)`                    | perf           |
| `event_live_logs`                 | `(expires_at)`                  | perf           |
| `event_member_notification_prefs` | `(member_id)`                   | unique         |
| `event_templates`                 | `(slug)`                        | unique         |
| `event_templates`                 | `(is_active)`                   | perf           |
| `event_invitation`                | `(event_id)`                    | unique         |
| `event_themes`                    | `(event_id)`                    | perf           |
| `event_themes`                    | `(template_id)`                 | perf           |
| `event_themes`                    | `(event_id) WHERE is_published` | unique partial |

---

## Naming Conventions

### Tables

- All prefixed with `event_`
- Snake case

### Columns

- `id` — uuid PK
- `event_id` — FK to events
- `created_at` — timestamptz, immutable on all tables
- `updated_at` — timestamptz, auto-updated on all tables
- `deleted_at` — soft delete, `events` table only, immutable once set
- Domain dates/times use `date` or `time` — no timezone
- `timestamptz` for system audit columns only

### Functions

| Pattern                                      | Purpose                                            |
| -------------------------------------------- | -------------------------------------------------- |
| `is_event_*`                                 | Boolean membership/existence check                 |
| `has_event_permission(id, resource, action)` | Single permission check — use for all RLS          |
| `get_current_*`                              | Returns current user's related ID or derived value |
| `create_*`                                   | Write ops via RPC                                  |
| `soft_delete_*`                              | Soft delete via RPC                                |
| `cancel_*` / `get_*`                         | Anon-accessible RPCs                               |
| `touch_*`                                    | Trigger: timestamp updates                         |
| `enforce_*`                                  | Trigger: immutability                              |
| `prevent_*`                                  | Trigger: block operations                          |
| `initialize_*`                               | Trigger: create companion rows on insert           |
| `derive_*`                                   | Trigger: auto-derive column values                 |
| `set_*`                                      | Trigger: auto-set column values on insert          |
| `claim_*`                                    | Invite acceptance/rejection via RPC                |

### Triggers

| Pattern                      | Purpose                            |
| ---------------------------- | ---------------------------------- |
| `touch_updated_at_{table}`   | Auto-update timestamp              |
| `immutable_{table}_{column}` | Lock specific column               |
| `immutable_root_role`        | Lock entire root role row          |
| `no_delete_root_role`        | Block delete of root role row      |
| `initialize_{noun}_rows`     | Seed companion rows on insert      |
| `set_{noun}_{table}`         | Auto-set column on insert          |
| `derive_{column}`            | Auto-derive column value on insert |

### Policies

| Pattern                     | Example                                                         |
| --------------------------- | --------------------------------------------------------------- |
| `{table}_{cmd}`             | `event_members_select`                                          |
| `{table}_{cmd}_{qualifier}` | `event_members_update_self`, `event_announcements_delete_admin` |

---

## Reference Chain

```
events
  ├── event_roles (event_id)
  │     └── event_role_permissions (category — not FK)
  └── event_members (event_id) ← only table referencing auth.users
        ├── events.created_by (back-reference)
        ├── event_timelines (event_id)
        ├── event_tasks (event_id, created_by)
        ├── event_rsvps (event_id)
        ├── event_announcements (event_id, created_by)
        │     └── event_announcement_reads (event_id, announcement_id, member_id)
        ├── event_vendors (event_id)
        ├── event_live_logs (event_id)
        ├── event_member_notification_prefs (member_id)
        ├── event_invitation (event_id) ← public-facing content + rsvp config
        └── event_themes (event_id) ← user-created invitation pages
              └── event_templates (template_id) ← design library, superuser-managed
```

---

## Deferred (Post-Launch)

| Feature       | Notes                                           |
| ------------- | ----------------------------------------------- |
| Budget        | `event_budget_categories`, `event_budget_items` |
| Seating       | `event_seating`                                 |
| Custom Domain | —                                               |
