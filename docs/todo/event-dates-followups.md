# Event Dates — parked follow-ups

Deferred from the multi-day events / Event Dates work. Both are agreed in
principle; parked so we don't lose them.

## #7 — Stepper "flow travelled" animation (create wizard)

The create-event stepper (`CreateEventStepper`) connector dash between steps
should animate the *flow* of progress:

- On **advance**: the dash fills **left → right** in the primary colour, then the
  completed step's **tick** animates in **after a delay**, so it reads as the
  progress travelling from one step to the next.
- On **back**: the same animation **reverses** (right → left, tick out).
- Timing: the entire **dash → tick** sequence should take the **same total time
  as the step-content slide** (`StepsDirection` / `animate-component-slide`) and
  **complete at the same moment**.

Touches: `src/pages/dashboard/create-event/CreateEventStepper.tsx`,
`src/pages/dashboard/animations.ts` (stepper variants), and the slide duration in
`src/components/animations/animate-component-slide.tsx`.

## #12 — Day delete: destructive modal + item handling

Today deleting a day in Event Dates is an inline confirm popover that
**cascade-deletes** the day's timeline items (guarded only against the last day).
Upgrade it:

- Replace the popover with a **destructive modal** (reuse
  `components/custom/confirm-alert-modal`).
- The modal must **list what will be removed** — e.g. "**N timeline items**" — so
  the user knows exactly what they're destroying. Extend the list as more features
  become day-bound (today only timeline items are tied to a day, via segments).
- Require the user to **type the day's label** to confirm.
- **Conditional friction (agreed):** an *empty* day → a light one-click delete; a
  day *with items* → the full modal (list + type-to-confirm).
- Needs a small count query/RPC, e.g. `get_day_item_counts(day_id)`.

### Open design — transfer vs cascade
Instead of cascade-deleting items, offer to **transfer them to another day** via a
picker in the modal. Complication: items hang off **segments**, segments off
**days**, with a *one-default-segment-per-day* rule — so you can't cleanly
re-parent a day's segments onto another day (the defaults collide). The clean
transfer = move the items into the **target day's default segment**, then delete
the source day (preserves items, flattens their segment grouping).

**Recommendation:** ship cascade-with-type-to-confirm first; add transfer as v2.
Avoid "disallow if items" — it traps the user (no easy "move item to another day"
path yet).
