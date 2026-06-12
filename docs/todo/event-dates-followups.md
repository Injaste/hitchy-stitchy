# Event Dates — parked follow-ups

Deferred from the multi-day events / Event Dates work.

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

## #12 — Day delete: destructive modal + item handling — ✅ shipped (block-on-items)

Shipped, but as **block-on-items** rather than the cascade/type-to-confirm/transfer
plan originally sketched:

- Inline popover → `DayDeleteModal` (reuses `confirm-alert-modal`), store-driven
  via `useDayModalStore`.
- A day **with** timeline items **can't** be deleted — the modal lists them
  (grouped under "Timeline") and tells the user to clear them first. An **empty**
  day → a plain confirm. Enforced server-side in `delete_day` (counts items via
  segments, raises if any).
- Day management is now **super-admin only** (client gate + the three day RPCs).
- Deliberately **no** type-to-confirm, **no** cascade, **no** transfer — blocking
  keeps items safe without a "move to another day" path existing yet.

Possible future v2 (only if the block proves annoying): offer to **transfer** a
day's items into another day's default segment, then delete the source day.
