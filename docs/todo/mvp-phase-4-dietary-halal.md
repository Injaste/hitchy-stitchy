# MVP Phase 4 — Dietary / halal

**Goal:** promote dietary needs from an RSVP config flag to a **first-class guest
field**, captured at RSVP and visible/filterable on the guest list. Multicultural
necessity in SG; also the prerequisite for sensible seating (phase 5).

## Scope
- A structured dietary field on each RSVP: at minimum **Halal**, **Vegetarian**,
  **No pork/lard**, **Allergies (free text)**, **None**. Multi-select + free text.
- Surfaced on the public RSVP form (guest-facing) and the admin guest list
  (column + filter + counts, e.g. "42 halal" for catering headcount).

## Data model (proposed)
- Add `dietary jsonb` (or `text[]` + `dietary_notes text`) to `event_rsvps`.
  Today dietary lives loosely in `event_invitation.config` form fields — this makes
  it structured and queryable. Migration + schema.sql sync.
- Thread through the RSVP submit/update RPCs (`submit_rsvp` / `update_guest`) and
  the guest fetch field list (`GUEST_FIELDS` in `src/pages/admin/guests/api.ts`).

## Frontend
- Public form: a dietary field component under `src/pages/wedding/form/fields/`
  (mirror `GuestCountField` / `MessageField`).
- Admin: a dietary column + filter on the guests table; aggregate counts in
  `GuestsHeader` / `DashboardStats`.
- The invitation **config** section already toggles form fields
  (`src/pages/admin/invitation/config/sections/FormFieldsSection.tsx`) — wire the
  dietary field's visibility/required there, consistent with existing fields.

## Tier
Free (basic dietary) — it's table-stakes and improves the free invitation loop.

## Complexity
Low. One column + form field + list column/filter. No new permission resource
(rides on `guests` / `invitation`).

## Open decisions
1. **Shape** — `text[]` of preset tags + a `dietary_notes` free text, vs a single
   `jsonb`. Leaning `text[]` + notes (easy to count/filter).
2. **Preset list** — confirm the SG-relevant presets above; make them editable per
   event, or fixed for MVP? Leaning fixed presets + free-text notes for MVP.

## Grounding
- RSVP form: `src/pages/wedding/form/` (fields, RSVPForm).
- Guest list + fetch fields: `src/pages/admin/guests/` (`api.ts` `GUEST_FIELDS`).
- Form-field config: `src/pages/admin/invitation/config/sections/FormFieldsSection.tsx`.
- Recipe + guardrails: [mvp-overview.md](mvp-overview.md).
