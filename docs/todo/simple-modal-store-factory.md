# Simple open/close modal-store factory

Deferred refactor: collapse the hand-rolled `{ isOpen, open, close }` singleton
modal stores into one factory, and rename the existing CRUD factory so the two are
clearly distinct.

## The problem

There are **two** shapes of modal store in the codebase, and only one has a factory:

- **CRUD modals** (create/edit/delete/detail + `selectedItem`) — already factored via
  `createModalStore<T, U>` in
  [src/pages/admin/hooks/useModalStore.ts](src/pages/admin/hooks/useModalStore.ts).
  Consumed by `useGiftModalStore`, `useMemberModalStore`, `useTaskModalStore`,
  `useDayModalStore`, `useExpenseModalStore`, `useTimelineModalStore`,
  `useGuestModalStore`.
- **Simple singleton modals** (`isOpen` / `open` / `close`, nothing else) — each one is
  hand-rolled and identical:
  - [src/pages/admin/plan/hooks/useUpgradeModalStore.ts](src/pages/admin/plan/hooks/useUpgradeModalStore.ts)
  - [src/pages/admin/invitation/hooks/useBespokeModalStore.ts](src/pages/admin/invitation/hooks/useBespokeModalStore.ts)

That's duplicated boilerplate with no shared source. (A third, `usePingStore`, is the
same shape **plus** a `targetRoleId` payload — see "Payload" below.)

## Naming smell to fix at the same time

The CRUD factory file is named `useModalStore.ts` but it exports `createModalStore`
(a factory, not a hook) and only covers the CRUD shape. The name oversells it. Rename
so "modal store" isn't claimed by the CRUD-only variant.

## Proposal

1. **New factory** for the simple shape, e.g.
   `src/pages/admin/hooks/createDisclosureStore.ts`:
   ```ts
   export function createDisclosureStore() {
     return create<{ isOpen: boolean; open: () => void; close: () => void }>(
       (set) => ({
         isOpen: false,
         open: () => set({ isOpen: true }),
         close: () => set({ isOpen: false }),
       }),
     );
   }
   ```
   Then `useUpgradeModalStore` and `useBespokeModalStore` become one-liners:
   `export const useBespokeModalStore = createDisclosureStore();`

2. **Rename the CRUD factory** file/export so the pair reads clearly:
   `useModalStore.ts` → `createCrudModalStore.ts`, export `createModalStore` →
   `createCrudModalStore`. Update the ~7 CRUD consumers' imports.

### Names to pick (decision)
- New simple factory: `createDisclosureStore` (React's "disclosure" term) /
  `createToggleStore` / `createOpenCloseStore`. **Lean: `createDisclosureStore`.**
- CRUD factory rename: `createCrudModalStore` (recommended) — or leave it, and only add
  the new factory (smaller diff, but the `useModalStore.ts`-exports-`createModalStore`
  mismatch stays).

## Payload variant (decide, don't assume)
`usePingStore` ([src/pages/admin/store/usePingStore.ts](src/pages/admin/store/usePingStore.ts))
is the simple shape + a `targetRoleId` carried through `open(roleId?)`. Options:
- Leave it hand-rolled (it's the only payload case) — simplest.
- Generalize the factory to `createDisclosureStore<P>()` with `payload: P | null` and
  `open(payload?: P)`. Only worth it if a second payload case appears.

**Lean: leave `usePingStore` as-is; keep the new factory payload-free.**

## Done when
- `useUpgradeModalStore` + `useBespokeModalStore` are factory one-liners; no behaviour
  change (same `isOpen/open/close` API, same call sites).
- CRUD factory renamed (if chosen) with all imports updated.
- `npm run build` passes (Vite, not just tsc).
- No stray `console.log` / commented code.
