# UI Tips / Shortcuts — settings section (handover)

A separate Event Settings section, a sibling **below** "Getting started", that teaches
people how to *use the app* — keyboard shortcuts and navigation tips (e.g. `⌘/Ctrl + B`
to toggle the sidebar). Split out of this conversation deliberately.

## Why it's separate from the setup guide

The setup guide ("Getting started") is a checklist of **event-setup milestones** — every
step completes from a real data artifact (`counts > 0`), usage, or being viewed, and each
maps to a place in the product. A "press ⌘B" tip is a **UI hint**, not a milestone: it
has no natural completion signal and nothing meaningful for the tour spotlight to point
at. Mixing hints into the checklist dilutes the "get your event live" narrative and
breaks the completion model.

So keep them apart: setup = milestones (the guide), tips = reference (this section).

## Where it plugs in

`src/pages/admin/settings/index.tsx` — add one `SettingsSection` to the `sections`
array, positioned **after** `getting-started`. Pattern to match (each section is
`{ id, label, icon, render }`):

```tsx
{ id: "tips", label: "Tips & shortcuts", icon: Keyboard, render: () => <TipsSection /> },
```

- Icon: `Keyboard` (or `Sparkles`/`Lightbulb`) from `lucide-react`.
- New component lives in a small folder, e.g. `src/pages/admin/settings/tips/` (mirror
  `notifications/` / `profile/` structure — `index.tsx` + a section component).

## Open decisions (settle before building)

1. **Audience.** Keyboard shortcuts and navigation apply to *everyone*, unlike the
   super-admin-only guide. Recommend making this section **all-members** — put it in the
   base `sections` array, NOT inside the `isSuperAdmin ? [...]` block. (Confirm: are any
   tips role-specific? If so, filter per-tip with `useAccess`, don't gate the whole
   section.)

2. **Completion model — recommend NONE.** Treat tips as static **reference cards**, not
   checkable steps. No `viewed_steps`, no tutorial-state writes, no spotlight arming.
   This keeps it decoupled from the `event_tutorial` row entirely. Only introduce a
   "seen" flag if there's a real reason to hide-after-first-view — and if so, it's a
   client/local preference, not event-scoped tutorial state.

3. **Desktop-only hints.** Keyboard shortcuts are meaningless on touch. Either gate the
   shortcut rows behind `useIsMobile()` (hide on mobile) or label them "on desktop".

## Content to seed

- **Toggle sidebar** — `⌘ B` / `Ctrl B` (verify the actual binding in the sidebar
  component before documenting — don't assume; grep `components/ui/sidebar.tsx` and any
  keydown handler for the real key).
- Any other existing global shortcuts (search the codebase for `addEventListener("keydown"`
  and `metaKey`/`ctrlKey` before writing the list — document only what's real).
- Navigation orientation tips if desired (where settings/account live, how to switch
  events) — keep these short and factual.

**Do not invent shortcuts.** Only list bindings that actually exist in the code. If a
tip describes a shortcut that isn't wired up, either wire it up first or leave it out.

## Rendering

Plain, non-interactive list — rows of `{shortcut chip} + {description}`. Reuse existing
primitives (`components/ui/`) rather than hand-rolling. Render the shortcut key using a
`<kbd>`-style chip; check whether one already exists (grep for `kbd`) before adding one.

## Definition of done

- Section appears below "Getting started" for the right audience.
- Every listed shortcut is verified against real code.
- No coupling to `event_tutorial` / setup-guide completion.
- `npm run build` clean.
