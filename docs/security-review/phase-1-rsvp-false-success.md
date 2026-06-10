# Phase 1 — RSVP false success (CRITICAL)

**Effort:** medium (~half day incl. testing) · **Impact:** game-breaking —
a guest whose RSVP submission fails sees the full success screen (confetti,
"success" heading) while **nothing was saved**. They will show up — or not —
based on an RSVP the couple never received. Same hole on edit and delete.
This is the public, unauthenticated surface; network flakiness on mobile makes
the failure path realistic, not theoretical.

## Root cause (two pieces that combine)
1. **The wrapper's `mutate()` never rejects.**
   `src/lib/query/useMutation.ts:83-85`:
   ```ts
   await _mutateAsync(args)
     .then(() => callbacks?.onSuccess?.())
     .catch(() => callbacks?.onError?.());
   ```
   Errors are routed to the optional `callbacks.onError` and swallowed; an
   `await mutate(...)` always resolves.
2. **The RSVP call sites await `mutate()` and treat resolution as success,
   with `silent: true` suppressing the error toast too.**
   `src/pages/wedding/templates/unique-muslim/RSVP.tsx:96-110`:
   ```ts
   await submit.mutate(value);
   setSubmitted(true);        // runs even when the RPC failed
   ...
   fireConfetti();
   ```
   - submit: lines 100-101 → false success screen
   - update: line 98 → false "updated" confetti
   - delete: `handleDeleteConfirm` line 114 → UI proceeds as if deleted
   The mutations in `src/pages/wedding/queries.ts:94-149` are all
   `silent: true`, so there is **no error feedback anywhere** — not even a toast.

## Fix
Per `docs/architecture/mutations.md` (UI side effects belong at the call site)
the wrapper already supports per-call callbacks — use them, don't change the
wrapper's no-throw contract (admin call sites rely on it):

```ts
const handleSubmit = async (value: RSVPFormData) => {
  const action = isEditing ? update : submit;
  await action.mutate(value, {
    onSuccess: () => {
      if (!isEditing) setSubmitted(true);
      setIsEditing(false);
      fireConfetti();
      /* scroll-into-view block */
    },
    onError: () => setSubmitError(true),   // new state → inline error message
  });
};
```

- Add a visible inline error state to the RSVP section (the form stays filled
  so the guest can retry — don't clear it). `silent: true` is correct for a
  themed public page (no admin toast styling); the inline message replaces it.
- Apply the same callback split to `handleDeleteConfirm` (RSVP.tsx:112-116).
- Check the other template(s) under `src/pages/wedding/templates/` for the
  same pattern before closing this out.
- Sanity-check admin call sites that `await mutate(...)` and then run
  success-only UI (grep `await .*\.mutate\(`); admin flows mostly rely on
  `isSuccess` props into `FormDialog`, which is fine — the bug shape is
  *sequential code after `await mutate()`*.

## Verification
- Dev server + DevTools offline mode: submit an RSVP with the network blocked
  → must show the inline error, must NOT show success/confetti; re-enable
  network, retry succeeds.
- Submit with an invalid `?code=` invite param → same expectation.
- Confirm a real success still confettis, sets the localStorage session, and
  the edit + delete paths behave on both success and failure.
- `npm run build`.
