# Handover — Timeline enhancements

Follow-on backlog for the **day → segment → label → card** timeline shipped on
`feat/timeline-segments`. Each item is sized to pick up cold: *what, why, backend
touch, frontend touch, complexity, grounding*. Nothing here is committed-to —
it's a menu; trim/reorder as priorities settle.

## Baseline (what already exists)
- **Tree:** `event_days` → `event_segments` → label groups → cards, assembled by
  `groupTimeline` (`src/pages/admin/timeline/utils.ts`).
- **Segments:** add / rename / delete / drag-reorder via `SegmentsSheet` +
  `useSegmentMutations` (`create_segment` / `update_segment` / `delete_segment` /
  `reorder_segments` RPCs). Per-segment **collapse persisted** to localStorage
  (`useSegmentCollapse`), with **collapse-all / expand-all** on the day header.
- **Items:** create / update / delete via segment-based RPCs. Crucially,
  `update_timeline` already takes `p_segment_id` **and** `p_label` and re-derives
  `day` from the segment — so *moving* an item across segment/label/day is a plain
  update, no new backend needed for the single-item case.
- **Cards:** start/end lifecycle, plan-vs-actual bar, "Live Now" cue
  (`ActiveCueBanner`). `DayTabs` + active-card use embla `startIndex` + `scrollTo`.
- **Realtime: `event_timelines` only** (`subscribeToTimeline`). `event_segments`
  has **no realtime** yet.
- **DnD reference implementation:** the Tasks board — `tasks/hooks/useTaskDnd.ts`,
  `tasks/components/TasksSection.tsx` (`SortableTaskItem`), `useCardFly` +
  `CardFlyOverlay` (clone fly-back), already proven with optimistic patch + revert.

---

## Requested (this thread)

### 3. Drag a **label group** into another segment
**What:** Drag a whole label group (e.g. "Vows") from one segment to another;
all its items get the new `segment_id` (+ re-derived `day`). **Backend:** either
N `update_timeline` calls (simple, chatty) or a **new bulk RPC**
`move_label_to_segment(event_id, from_segment, label, to_segment)` (one round
trip, atomic) → needs a timestamped migration + `schema.sql` sync. **Frontend:**
vertical drag of the `SegmentLabel` block across `DaySegment` containers; reuse
the Tasks dnd pattern. **Complexity:** medium-high.

### 4. Drag a **card** into another label / segment
**What:** Drag a `TimelineCard` to a different label group or segment;
single-item `update_timeline` with the new `segment_id`/`label`. **Backend:**
already supported. **Frontend — the hard part:** cards live inside **embla
carousels** (`LabelCarousel`), so this is cross-container drag *out of a
horizontal scroller into another*. dnd-kit + embla interaction needs care
(pointer capture vs embla's own drag; `watchDrag` is currently gated on
scrollability). **Complexity:** high. **Recommendation:** pair it with #5 (a
non-drag "Move to…" action) so the capability exists even where drag is awkward
(mobile, cross-day).

---

## Proposed (additional ideas)

### 5. "Move to…" menu action on cards (drag complement)
**What:** A kebab/long-press on a card → "Move to segment / label / day" picker.
**Why:** drag can't reach **other days** (they're behind tabs) and is fiddly on
mobile; a menu is reliable everywhere and reuses the existing segment select.
**Backend:** `update_timeline` (done). **Touch:** FE — a small modal/menu + the
`SelectField` segment picker already built. **Complexity:** low-medium. *Arguably
do this before #4 — it delivers the same outcome at a fraction of the risk.*

### 6. `event_segments` realtime
**What:** Subscribe to `event_segments` changes so a collaborator's add / rename /
delete / reorder shows live (today only items sync). **Backend:** enable realtime
on the table; mirror `subscribeToTimeline`. **Frontend:** a `useSegmentsRealtime`
that patches `eventSegments` in the cache and re-`groupTimeline`s. **Complexity:**
medium. **Note:** coordinate with the deferred soft-delete work
(`SOFT-DELETE-UNDO-HANDOFF.md`) — both touch the realtime handlers.

### 7. Segment presets (SG-first)
**What:** One-tap "add a standard set" — e.g. **Akad/Nikah · Bersanding/Reception ·
Tea ceremony · Photoshoot**. **Why:** matches the SG multi-ceremony reality
(see `PHASE-1-PAYMENTS-HANDOFF.md` product context); saves manual setup.
**Backend:** batched `create_segment`, or a `seed_segments` RPC. **Complexity:**
low-medium (mostly a curated preset list).

### 8. Segment color / icon
**What:** Let a segment carry a color or icon so the rail/headings are visually
distinct (today all use one glyph). **Backend:** add `color`/`icon` columns to
`event_segments` (migration + `schema.sql`); thread through `create/update_segment`.
**Frontend:** picker in `SegmentsSheet`; apply to heading + rail. **Complexity:**
medium.

### 9. Run-sheet export (print / PDF)
**What:** A printable day-of run sheet (segments → items → times → assignees) to
hand coordinators/vendors. **Why:** high real-world value — people print these;
also feeds the pending **check-ins / live-logs** features. **Touch:** FE
(print stylesheet or a generated view); no backend. **Complexity:** medium.

### 10. Smaller wins
- **"Jump to live"** affordance when an item is active but scrolled off (reuse the
  active-card index already computed in `LabelCarousel`).
- **Duplicate** a segment or item.
- **Overlap / gap warnings** — flag items that overlap in time within a segment,
  or large gaps; surface as a subtle inline hint (the plan-vs-actual math in
  `PlanActualBar` is a starting point).
- **Per-segment default assignees** — assign a coordinator to a whole segment.

---

## Cross-cutting notes
- **DnD (#3, #4):** reuse the Tasks recipe end-to-end — `useSortable` + clone
  `Feedback`, optimistic cache patch on drop, `useCardFly`-style revert on error,
  success/destructive rings. The novel risk vs Tasks is **embla**: timeline cards
  are in horizontal carousels and items are **time-sorted** (not free-ordered), so
  dropping into a label/segment changes *membership*, not a manual index — there's
  no `position` column to write (unlike tasks). Keep that distinction clear.
- **Optimistic updates:** all timeline mutations re-`groupTimeline` from the flat
  cache (`flattenTimeline` → patch → `groupTimeline`); follow that for moves.
- **Time math:** moving across days re-derives `day` server-side from the segment;
  the client reads date/time off `item.day` (`scheduledStartDate` etc.), so a moved
  card's lifecycle/progress follows automatically.

## Guardrails & grounding (from CLAUDE.md)
- DB lives in Supabase; `schema.sql` + `migrations/` are the source of truth.
  Any new RPC (e.g. `move_label_to_segment`, `seed_segments`) or column (segment
  `color`/`icon`) = a timestamped migration + `schema.sql` sync. Never call an RPC
  not in schema/migrations.
- `useAccess()` is the only client gate; server (RLS + RPCs) is the boundary —
  new move/bulk RPCs must re-check `has_event_permission(event_id, 'timeline'|'…',
  action)`.
- Reuse the feature-folder pattern + existing primitives (`useMutation`,
  `lib/animations`, `queryKeys`). Run `npm run build` before done. No
  `console.log` / TODO / commented code in commits.
- **Files:** `src/pages/admin/timeline/{components,modals,hooks}`, `api.ts`,
  `queries.ts`, `utils.ts`; dnd reference `src/pages/admin/tasks/`.

## Open decisions
1. **#4 vs #5 first** — drag-the-card (high-risk, embla) vs "Move to…" menu
   (low-risk, same outcome). Recommendation: menu first, drag later.
2. **Bulk move RPC** (`move_label_to_segment`) vs N single updates for #3.
3. **Cross-day moves** — allow at all? If yes, only via the menu (#5), since drag
   can't reach hidden day tabs.
4. **Segment metadata** — is color/icon (#8) worth a schema change, or skip?
5. **Tier-gating** — do any of these (run-sheet export, presets) belong behind a
   plan tier per `PHASE-1-PAYMENTS-HANDOFF.md`? Declare it as each is built.
