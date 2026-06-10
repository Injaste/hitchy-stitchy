# Mutations

All mutations go through `lib/query/useMutation.ts`, with three feedback modes:

- **Simple** `{ successMessage, errorMessage }` → auto toasts.
- **Promise** `{ toast: {...} }` → one promise toast.
- **Silent** `{ silent: true }` → no toast; caller surfaces it (usually `<FormError>`, see [forms.md](forms.md)).

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
