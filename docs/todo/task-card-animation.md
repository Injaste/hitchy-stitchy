# Task-card animation TODOs

Deferred notes on the tasks-board card motion (entrance + checkbox "fly").

## ⚠️ Breaking: entrance animation makes a dragged card vanish
`src/pages/admin/tasks/components/TasksSection.tsx` (the `EnteringItem` wrapper)

**Status: the entrance-animation work is currently STASHED** (`git stash` →
"tasks: card entrance animation"), because of this bug — it is NOT in the tree.

When dragging a card, the card sometimes disappears (renders as though
`opacity: 0`) even though the drag still works — the layout keeps shifting under
dnd-kit as expected, just with an invisible card. The `EnteringItem` motion
wrapper (opacity/scale entrance) is the cause; its opacity state appears to get
re-applied during drag. Resolve before un-stashing / shipping the entrance
animation.

## Fly clone: scale 1 → 1.05 never plays
`src/pages/admin/tasks/hooks/useCardFly.ts` + the fly overlay component

When marking a task done/undone, a clone is created to fly to the new column.
The intended scale-up (1 → 1.05) during flight doesn't happen. Fix so the clone
animates the scale while airborne.

## Fly landing position drifts when the user scrolls mid-flight
`src/pages/admin/tasks/hooks/useCardFly.ts` (`land`)

`land` reads the destination rect once (double rAF). If the user scrolls the
board left/right while the clone is mid-air, the real card's viewport rect moves,
so the captured landing target is now wrong and the clone lands off-position.
Track the landing rect with a rAF loop (re-read on each frame) so it always flies
to the card's current position, not a stale snapshot.
