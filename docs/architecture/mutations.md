# Mutations

All mutations go through `lib/query/useMutation.ts`, with three feedback modes:

- **Simple** `{ successMessage, errorMessage }` → auto toasts.
- **Promise** `{ toast: {...} }` → one promise toast.
- **Silent** `{ silent: true }` → no toast; caller surfaces it (usually `<FormError>`, see [forms.md](forms.md)).
- **Simple + `onUndo`** → the success toast grows an Undo button and a longer
  window. This is the L5 (undo over confirm) primitive — see
  [destructive-actions.md](destructive-actions.md). `onUndo: (result, args) =>
  (() => void) | void` is resolved once at success time, not eagerly — return
  a handler to show the button, or nothing to leave the toast plain. That lets
  one mutation used in both directions offer undo on only the destructive one
  (task archive shows Undo; the restore it triggers doesn't loop back).
  Two shapes so far:
  - **Symmetric flip** (task archive/restore) — the handler just re-calls the
    same mutation with the arg flipped.
  - **Grouped + consolidated** (guest bulk status) — a bulk action can sweep up
    rows with different prior values, so undo has to send each back to its OWN
    previous value, not one shared one. The handler regroups and calls the raw
    API directly (not `mutation.mutate`, which would fire its own toast per
    call) so the whole undo still lands as one toast, matching the original.

**Toast duration is intentionally split:** errors use `ERROR_TOAST_DURATION`
(8s) so a server message is readable; success keeps sonner's ~4s default. This
lives in the wrapper (simple + promise mode), not the `<Toaster>` — sonner has no
per-type duration. Don't collapse it back to uniform. Dialogs (which stay open on
error) and optimistic inline edits (e.g. budget total) rely on the longer window;
drag reorders stay `silent` and feed back via the revert animation.

`mutate(args, callbacks?)` — vars first, `{ onSuccess }` second. Passing the
callback as the first arg silently drops it (bit us in `AdminLogout`).

## Side effects: data → hook, UI → call site

| Effect | Lives in |
|---|---|
| `invalidateQueries` / `setQueryData`, auto-toast | query hook |
| navigation, close modal, reset form, focus | call site |

**Litmus:** same for every caller + about server/cache state → hook. Varies by
caller / touches router / DOM / UI → call site. If two call sites need different
behavior, it's call-site (logout: dashboard → `/login`, admin → `/${slug}`). A
data hook shouldn't import `useNavigate`. `useLoginMutation` is the model: cache
write in the hook, redirect in the component.
