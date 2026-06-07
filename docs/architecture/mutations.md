# Mutations

All mutations go through `lib/query/useMutation.ts`, with three feedback modes:

- **Simple** `{ successMessage, errorMessage }` → auto toasts.
- **Promise** `{ toast: {...} }` → one promise toast.
- **Silent** `{ silent: true }` → no toast; caller surfaces it (usually `<FormError>`, see [forms.md](forms.md)).

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
