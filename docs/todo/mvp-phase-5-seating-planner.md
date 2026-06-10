# MVP Phase 5 — Seating / table planner

**Goal:** assign confirmed guests to banquet tables. SG-banquet-shaped: round
tables of ~10, VIP/family tables, a vendor/helper table, halal vs non-halal
grouping. Visual, high-value, and the heaviest build — scheduled after guests +
dietary (phase 4) are solid.

## SG shaping
- Default table capacity **10** (configurable 8/10/12); table **numbering**.
- Table **kinds**: VIP / family / regular / vendor-helper.
- Use phase-4 **dietary/halal** flags to warn on mixed tables and to size
  halal vs non-halal tables for catering.
- Day/segment-scoped — the banquet is typically one `event_segment`; slots into
  the existing `event_days` spine (Advanced tier gets per-day charts).

## Data model (proposed — confirm in migration)
- `event_tables`: `id`, `event_id` (FK, denormalised), `day_id`/`segment_id`
  (scope), `label text` (e.g. "Table 1"), `capacity int DEFAULT 10`,
  `kind text`, `pos jsonb NULL` (x/y for the canvas), `sort_order int`, timestamps.
- `event_seat_assignments`: `id`, `event_id`, `table_id` (FK), `rsvp_id`
  (FK → `event_rsvps`), optional `seat_no int`, timestamps. Unique `(rsvp_id, …)`
  so a guest sits at one table per chart.

## Backend
Recipe-standard. New `seating` resource (catalog + both group seeds + backfill).
RPCs: `create_table` / `update_table` / `delete_table`, `assign_seat` /
`unassign_seat` / `move_seat`, plus maybe `seed_tables(count)`. Capacity is a
**soft** rule (warn, don't hard-block — real weddings overfill). Migration + schema.sql sync.

## Frontend — the hard part
- Feature folder `src/pages/admin/seating/`.
- **Reuse the dnd-kit recipe already proven in this codebase** — drag guests onto
  tables the way Tasks drags cards: `src/pages/admin/tasks/hooks/useTaskDnd.ts`,
  `useCardFly` + `CardFlyOverlay` (optimistic patch + revert on error). The
  Timeline handoff documents the same recipe.
- A **non-drag "Assign to table…" menu** as the mobile/fallback path — the timeline
  team already learned drag alone is fiddly on mobile; ship the menu alongside.
- Left rail: unassigned confirmed guests (from `event_rsvps` where status =
  confirmed); canvas/grid of round tables; capacity + dietary warnings inline.

## Tier
**Pro** (1 chart) → **Advanced** (per-day charts), per the payments handoff.

## Complexity
High — canvas + cross-container dnd + capacity/dietary rules. Biggest of the MVP
phases; do it once guests + dietary are stable.

## Open decisions
1. **Canvas vs list-first** — full drag canvas, or ship the list/menu assignment
   first and add the visual canvas second? (Lower risk to start list-first.)
2. **Scope unit** — per `event_day`, per `event_segment`, or per event for Pro?
3. **Pull source** — confirmed RSVPs only, or allow manual/walk-in seats too.
4. **Seat-level vs table-level** — assign to a table (simpler) vs specific seats.
   Leaning table-level for MVP.

## Grounding
- DnD reference: `src/pages/admin/tasks/` (`useTaskDnd.ts`, `TasksSection.tsx`), `useCardFly` + `CardFlyOverlay`; notes in [`timeline-enhancements.md`](timeline-enhancements.md).
- Guests source: `src/pages/admin/guests/`, table `event_rsvps`.
- Day/segment spine: `event_days` / `event_segments`, `useTimelineDays.ts`.
- Recipe + guardrails: [mvp-overview.md](mvp-overview.md).
