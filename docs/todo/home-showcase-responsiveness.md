# Home Features showcases — responsiveness

Deferred plan. Make the home page Features section fully responsive (mobile ·
tablet · desktop) **without breaking the zero-layout-shift guarantee** the
showcases depend on. Audited 2026-06-23; implementation not started.

Scope is `src/pages/home/` only. Decisions in §2 are confirmed — do not
re-litigate them.

---

## 1. The constraint you must design around

`EXAMPLE_HEIGHT` in `src/pages/home/components/Features.tsx` (the
`const EXAMPLE_HEIGHT: Record<string, number>`) reserves each showcase's
**tallest animation state** so its box never resizes while the animated child
cycles:

- gifts adds/removes rows (6 → 7 → 8 → 6)
- budget's "due now" pill + per-row "S$X left" sublines appear/disappear across 4 phases
- the tasks hero card appears in a lane then fades out
- RSVP swaps between form / success / guest-table (very different heights)

The box is rendered fixed-height with `style={{ height: EXAMPLE_HEIGHT[key] }}`
and content vertically centered (`flex flex-col justify-center`). Result: the box
is dimensionally stable → CLS 0.

**The bug:** those height values were tuned at desktop width. Content reflows
**taller** as the box gets narrower (more text wrapping). So a single global
height under-reserves on mobile. **Do NOT "fix" this with height-auto** — that
reintroduces the jank the fixed height prevents. The fix is: keep heights fixed,
but make each width-sensitive showcase's reserved value **per-breakpoint**.

---

## 2. Confirmed decisions

1. **Tasks board, mobile:** stack the 3 lanes vertically, matching the admin
   board `src/pages/admin/tasks/components/TasksView.tsx` (see its lane-board
   comment + the `flex flex-col gap-5 md:grid md:grid-cols-[repeat(3,minmax(300px,1fr))] md:overflow-x-auto`
   line). The showcase currently hardcodes `grid h-full grid-cols-3` in
   `src/pages/home/components/showcases/TasksShowcase.tsx` and must adopt the
   stack-below-md / grid-md+ pattern. The animated hero card travels **vertically**
   via its existing `layoutId="hero-card"`.
2. **Tasks lane order (mobile stack):** To do → In progress → Done (demo
   narrative; the hero animates downward through the funnel). Note this differs
   from admin, which puts In progress first on mobile — intentional for the demo.
3. **Budget ↔ Gifts height match:** enforce equal heights **only at `xl+`**
   (where they share a row via `grid xl:grid-cols-2`). Below `xl` they stack, so
   each uses its own right-sized height — this removes the gifts dead-space on
   tablet/mobile.
4. **Mechanism for per-breakpoint heights:** feed the value into the existing
   inline `style={{ height }}` via a breakpoint hook (consistent with
   `useIsMobile` already used in `src/pages/home/index.tsx`). Do **NOT** use
   arbitrary Tailwind height classes (`h-[590px]`) — violates the project
   no-arbitrary-values rule.
5. **Alignment:** switch showcase content from `justify-center` to top-aligned
   (`justify-start`). With right-sized heights residual slack is small; where
   slack remains (gifts at xl, matched to budget) top-align makes the gifts
   header line up with budget's — better for the side-by-side row.

---

## 3. Measured data (tallest content height across a full animation cycle)

Box widths differ per breakpoint because of the grid layout (wide features
`max-w-3xl`; budget/gifts `max-w-xl`, side-by-side only at xl). Numbers are px,
measured by polling real `scrollHeight` / child rect every 200ms for 15s.

| showcase | desktop 1440 (need / reserved) | tablet 768 | mobile 375 | current single reserve |
|---|---|---|---|---|
| days      | 246 | 285 | **312** | 340 |
| timeline  | 242 | 241 | 241 | 260 |
| tasks     | 420 | 420 | **457** (and will balloon when stacked) | 420 |
| budget    | 517 | 515 | **581** | 525 |
| gifts     | 352 | 437 | 449 | 525 |
| team      | 480 | 478 | 482 | 490 |
| rsvp      | 555 | 555 | 555 | 555 |

**Failures today:** budget content (581) overflows its 525 box on mobile by 56px
→ the card jitters vertically every animation phase + footer spills into the
section gap. tasks overflows 37px on mobile even before restructuring. gifts
wastes 76px (mobile) / 88px (tablet) / 173px (desktop) of dead-space.

**Width-stable → keep one fixed height, no change:** timeline, team, rsvp.
**Width-sensitive → need per-breakpoint height:** days, budget, gifts, tasks.

### Proposed reserved heights (verify by re-measuring after each change)
- days  → mobile ~320 / tablet ~295 / desktop ~255
- budget → mobile ~590 / tablet 525 / desktop 525 (keep ≥ gifts for the xl row)
- gifts → mobile ~460 / tablet ~450 / **desktop 525** (matched to budget, xl only)
- tasks → desktop/tablet 420 / **mobile = re-measure after stacking** (~800–900 est)

---

## 4. Execution checklist

Order: do the zero-shift-critical items (heights + tasks) first.

- [x] **Per-breakpoint heights.** `EXAMPLE_HEIGHT` now `{ mobile, tablet, desktop }` per key;
      `useShowcaseHeight` hook resolves via `useMediaBreakpointUp("md"/"xl")`. Re-measured
      tasks mobile = 767px max → reserve 775. All other values from §3.
- [x] **Top-align content.** `justify-center` → `justify-start` in `FeatureCard`.
- [x] **Budget/Gifts xl-only match.** gifts desktop=525 (matched); below xl each uses own value.
- [x] **Tasks responsive layout.** `flex flex-col gap-2.5 md:grid md:h-full md:grid-cols-3`
      in `TasksShowcase.tsx`; lanes drop `h-full` on mobile. Hero travels vertically on mobile.
- [x] **Re-measured all** at 375/768/1280 — zero overflows, tight slacks everywhere.

### Non-height holistic items (lower priority, same section)
- [x] Features section `bg-muted/20` added for separation from Hero.
- [x] Title→showcase gap increased `mt-8` → `mt-12`.
- [x] Footer nav columns 2-up on mobile: `grid-cols-2`, brand `col-span-2 md:col-span-1`.
- [x] Navbar logo `shrink-0` — wordmark no longer wraps at narrow widths.
- [x] DaysShowcase "Solemnisation" → "ROM" — fits the 64px tile label area.
- [x] CTABanner arrow `size-10 md:size-16 shrink-0` — stays inline on mobile.

---

## 5. How to verify (runtime, not tsc)

Run the dev server and drive the real page. To measure a showcase's true tallest
state at a given viewport width, poll content height across a full animation
cycle (≥15s to cover RSVP's ~13s rotation). Reference snippet used during the
audit (run in the browser console / preview eval, with the Features section in
the DOM):

```js
(() => {
  const names = ['days','timeline','tasks','budget','gifts','team','rsvp'];
  const boxes = [...document.querySelectorAll('div[style*="height"]')]
    .filter(d => d.className.includes('justify') && d.className.includes('flex'))
    .map((b,i) => ({ el:b, name:names[i], fixedH:Math.round(b.offsetHeight), max:0 }));
  return new Promise(res => {
    const tick = () => boxes.forEach(o => {
      const c = o.el.firstElementChild;
      o.max = Math.max(o.max, Math.round(o.el.scrollHeight),
                       c ? Math.round(c.getBoundingClientRect().height) : 0);
    });
    const iv = setInterval(tick, 200); tick();
    setTimeout(() => { clearInterval(iv);
      res(JSON.stringify(boxes.map(({name,fixedH,max}) =>
        ({ name, fixedH, need:max, overflow:max-fixedH }))));
    }, 15000);
  });
})()
```

Pass criteria per breakpoint (375 / 768 / 1440): `overflow <= 0` for every
showcase (no spill / no intra-animation jitter) AND dead-space small (reserved −
need not wildly large, except gifts at xl which is intentionally matched to
budget). For tasks, also visually confirm the hero card travels correctly
(vertical on mobile, horizontal md+) with no clipping.

Finish with `npm run build` (Vite catches what tsc misses) before marking done.
