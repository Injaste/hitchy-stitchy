# Invitation feature — align with the `{Domain}View` convention

Deferred refactor: the invitation feature deviates from the per-feature architecture
every other admin domain follows. Pre-existing (not introduced by the bespoke work) —
captured here so it's a deliberate decision, not drift.

## The convention (tasks, budget, gifts, members, timeline, access)

```
index.tsx            thin entry — calls the query hook, then renders:
  {Domain}Header       query state via props
  {Domain}View         query state via props   ← the main view component
  {Domain}Modals       barrel from modals/index.tsx, mounted here
```

`index.tsx` owns the query; `{Domain}View.tsx` receives
`data/isLoading/isError/refetch/isRefetching`; modals are one flat barrel at the entry.
See [budget/index.tsx](src/pages/admin/budget/index.tsx),
[gifts/index.tsx](src/pages/admin/gifts/index.tsx),
[tasks/index.tsx](src/pages/admin/tasks/index.tsx).

## How invitation diverges (3 counts)

[invitation/index.tsx](src/pages/admin/invitation/index.tsx) →
[components/Hub.tsx](src/pages/admin/invitation/components/Hub.tsx)

1. **Name:** the main view is `Hub`, not `InvitationView`.
2. **Query ownership:** `Hub` self-fetches `useInvitationsQuery()` instead of receiving
   it as props; `index.tsx` calls the same query *again* just to feed the header.
3. **Modal mounting is split, not a barrel:** `Hub` mounts `<InvitationSheet />` (and now
   `<BespokeRequestModal />`) directly. The `InvitationModals` barrel
   ([modals/index.tsx](src/pages/admin/invitation/modals/index.tsx)) is only the
   *editor's* confirm dialogs and is mounted deep inside
   [EditPanel.tsx](src/pages/admin/invitation/components/EditPanel.tsx), parameterized by
   the `edit` controller — not at the page entry.

## Why it's defensible (don't refactor blindly)

Invitation is heavier than the CRUD-list features: a browse/edit **sheet** with an
embedded editor + a persistent preview iframe. The split modal lifecycle (sheet vs
editor-confirms) is intentional, and full prop-drilling of query state may not pay off.
So this is a judgment call, not an obvious bug.

## Options

1. **Leave as-is.** Accept invitation as the documented exception.
2. **Cosmetic alignment (low risk):** rename `Hub` → `InvitationView` (file + import in
   `index.tsx`); optionally lift `useInvitationsQuery()` to `index.tsx` and pass it down
   so it isn't fetched twice. Don't touch the editor's modal split.
3. **Full alignment:** option 2 + reconcile modal mounting toward the `{Domain}Modals`
   barrel pattern. Largest diff; fights the intentional sheet/editor split — probably not
   worth it.

**Lean: option 2** if we want consistency; otherwise option 1 and note it as the exception.

## Interplay with the bespoke modal
`<BespokeRequestModal />` is currently mounted inside `Hub`, matching Hub's own precedent
(`InvitationSheet`). It deliberately does **not** sit in the `InvitationModals` barrel
(that needs an `edit`/`onSheetClose` controller it has nothing to do with). If option 2/3
moves modal mounting, move the bespoke modal with it.

## Done when
- Chosen option applied; no behaviour change to the invitation hub, sheet, editor, or the
  bespoke card/modal.
- `npm run build` passes.
