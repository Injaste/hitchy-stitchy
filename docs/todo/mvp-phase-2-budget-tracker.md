# MVP Phase 2 — Budget tracker

**Goal:** couples track wedding spend — cost vs paid vs outstanding, in SGD.
The biggest gap vs every competitor; establishes the "money resource" pattern
phase 3 (ang bao) reuses, and is a natural Pro upsell.

## Deferred / next

- **Per-day budgeting (multi-day weddings).** Some cultures' weddings span days
  (akad, reception, …) and couples want a budget *per day*. The day spine already
  exists (`event_days` + `event_segments` from the timeline).
  - *Data:* make `event_budget` per-`(event_id, day_id)` (or a `budget_total` on
    `event_days`); add a nullable `day_id` FK on `event_expenses` → `event_days`.
  - *UX:* day tabs above the sheet (reuse `timeline/components/DayTabs.tsx`),
    per-day hero + an "all days" rollup.
  - *Open Qs:* a budget **cap** per day vs just grouping/filtering by day? Is day
    **mandatory** or optional per expense (some span all days, e.g. photographer)?
    How to surface event-wide expenses.
- **Contributions-by-payer rollup.** The `payer` label exists; add a breakdown
  (Bride's family S$X · Groom's family S$Y · Couple S$Z). Build once it has data.
- **Realtime.** No `subscribeToExpenses` yet — add a `postgres_changes` channel on
  `event_expenses` for live multi-editor updates (mirror `subscribeToGuests`).
- **Category.** Dropped for simplicity; re-add as a column + grouping if wanted.
- **Free-tier limit.** Wire the cap when `usePlan()` lands (e.g. a low line cap).

## Open decisions
1. **Packaging with ang bao** — keep a separate `budget` resource (current), or a
   shared `money` resource / "Money" section with Budget + Ang bao tabs? Decides
   which resource gates these tables and shapes phase 3. (See overview #2.)
2. **Free-tier limit** shape.
