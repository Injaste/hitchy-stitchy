# Task-card animation TODOs

Deferred notes on the tasks-board card motion (entrance + checkbox "fly").

## Per-card entrance animation — DROPPED
`src/pages/admin/tasks/components/TasksSection.tsx`

Not pursuing for now. The stash it lived in ("tasks: card entrance animation")
is gone, and no `EnteringItem` wrapper is in the tree — only the column-level
`taskSectionEnter` stagger ships. So there is no bug to fix and no feature to
un-stash; this is closed.

If per-card entrances are revisited, watch for the original blocker: the motion
wrapper's opacity state got re-applied during a dnd-kit drag, so a dragged card
rendered at `opacity: 0` (drag still worked, card invisible). Solve that before
shipping.

## Fly clone scale — DONE (different values)
`src/pages/admin/tasks/components/CardFlyOverlay.tsx`

The clone does scale in flight — it lifts at `1.03` and settles to `1`. That's
not the originally-noted `1 → 1.05`, but the mechanic is in place and the motion
reads well, so leaving as-is.

## Fly landing drift on mid-flight scroll — DONE
`src/pages/admin/tasks/hooks/useCardFly.ts` (`land`)

`land` now chases the destination rect with a rAF loop, re-reading the card's
live viewport rect each frame instead of snapshotting it once. A board scroll
during flight no longer leaves the clone flying to a stale target. The loop
self-cancels when the flight is superseded, the card unmounts, or the spring
settles (overlay's `onAnimationComplete → clear()`).
