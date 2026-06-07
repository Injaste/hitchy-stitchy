# Auth

## Structure

All auth under `src/auth/` — infra at root, pages nested:

```
src/auth/
  AuthGate.tsx, api.ts, queries.ts    # session infra (gate, getUser, logout, listener)
  sign-in/  sign-up/  reset-password/  # public pages (+ own api/queries/types)
```

`change-password` is **not** here — it's authenticated settings
(`pages/admin/settings/`), not auth-entry. Login-specific data
(`useLoginMutation`, `loginUser`, `signInSchema`) stays in `sign-in/`; shared
session stuff stays at the root.

## Gate → /login

`AuthGate` (wraps dashboard + admin) redirects logged-out users to
`/login?redirect=<target>` instead of rendering the form inline — so sign-in
renders in one place. Route is `/login` per the naming rule.

## Login flow (`sign-in/`)

1. Already authed → `<Navigate>` away.
2. **`?redirect` is sanitized** to a same-origin path (`isSafeRedirect`); anything
   else → `/dashboard`, and an unsafe value is scrubbed from the URL on arrival.
   **Security control — never navigate a raw redirect param.**
3. On success `useLoginMutation` writes the user to the auth cache **and**
   navigates to the safe redirect.

> Why the cache write: `/login` is outside `AuthGate`, so the session listener
> isn't mounted. Without it the redirect reads a stale "logged out" cache
> (`staleTime: Infinity`) and loops back to `/login`. It's in `onSuccess` (runs
> before `mutateAsync` resolves), so the cache is authed before we navigate.

## Logout

Destination is context-specific → at the call site (see [mutations.md](mutations.md)):
dashboard → `/login`, admin → `/${slug}`. Cache-clear is automatic via the listener.
