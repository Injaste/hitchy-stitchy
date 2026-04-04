# Hitchy Stitchy — Wedding Admin Platform

Multi-tenant SaaS for wedding event management hosted at `hitchystitchy.com`.
Friendly, approachable, playful brand. Core loop: create event → admin dashboard → guest RSVP.

---

## Tech Stack

| Tool | Role |
|---|---|
| Vite + React + TypeScript | App framework |
| Supabase | Database, Auth, Edge Functions |
| shadcn/ui | Component library (radix-vega style) |
| Framer Motion | All animations |
| Zustand | Global state (3 stores) |
| Sonner | Toast notifications |
| date-fns | All date formatting and math |
| Embla Carousel | Carousel components |
| Zod | Schema validation |
| @tanstack/react-form | Form state management |
| @tanstack/react-query | Server state (via custom wrappers) |
| react-day-picker | Calendar / date range picker |
| lucide-react 

---

## Routing

```
/                   → Home (marketing)
/signup             → Sign up (new account)
/dashboard          → Dashboard (lists all events for the authed user)
/create-event       → Create event wizard
/:slug              → Public invitation page (no auth)
/:slug/admin        → Admin suite (protected)
```

---

## File Structure

```
src/
├── auth/                        ← Auth gate, login, queries, api
├── hooks/
│   └── use-mobile.ts            ← useIsMobile() hook (768px breakpoint)
├── lib/
│   ├── animations.ts            ← Shared Framer Motion variants
│   ├── supabase.ts              ← Supabase client
│   ├── types/                   ← Shared types
│   ├── utils/
│   │   ├── utils.ts             ← cn(), general helpers
│   │   └── utils-time.ts        ← formatDateRange, getDaysUntil, getEventStatus
│   └── query/
│       ├── useMutation.ts       ← Custom mutation wrapper (3 modes)
│       ├── useQuery.ts          ← Re-export / thin wrapper
│       └── types.ts             ← MutationOptions types
├── components/
│   ├── animations/
│   │   ├── animate-component-fade.tsx     ← ComponentFade wrapper
│   │   ├── animate-component-slide.tsx    ← ComponentSlide wrapper
│   │   ├── animate-odometer-digit.tsx     ← OdometerDigit
│   │   └── forms/
│   │       └── field-animate.tsx          ← AnimateItem (field error animation)
│   ├── custom/
│   │   ├── steps.tsx            ← Steps + useSteps (wizard step system)
│   │   ├── loading.tsx
│   │   ├── container.tsx
│   │   └── countdown-timer.tsx
│   └── ui/                      ← shadcn components
├── pages/
│   ├── home/                    ← Marketing landing page
│   ├── signup/                  ← Sign up page
│   ├── dashboard/               ← Event listing dashboard
│   ├── create-event/            ← Event creation wizard
│   ├── invitation/              ← Public RSVP/invitation page
│   ├── planner/                 ← (if exists) planner views
│   └── admin/                   ← Admin suite
│       ├── AdminPage.tsx
│       ├── animations.ts
│       ├── store/
│       │   ├── useAdminStore.ts
│       │   ├── useModalStore.ts
│       │   └── useCueStore.ts
│       ├── components/
│       └── features/
│           ├── timeline/
│           ├── operations/
│           │   ├── checklist/
│           │   ├── team/
│           │   └── live/
│           ├── admin-panel/
│           │   ├── rsvp/
│           │   └── users/
│           ├── settings/
│           ├── ping/
│           └── notifications/
```

---

## Database (Supabase — source of truth)

### Reference chain
```
auth.users → event_members (ONLY direct auth reference)
          → everything else references event_members.id
```

### Key tables
| Table | Notes |
|---|---|
| `events` | `deleted_at` immutable-once-set; recovery via direct SQL |
| `event_members` | `is_active` for revocation instead of deletion |
| `roles` | |
| `event_appearance` | Template system for future multi-template support |
| `event_rsvp_config` | Flat boolean columns for field visibility |
| `event_settings` | Internal admin config |
| `event_templates` | Platform-managed only, no client writes |
| `member_notification_prefs` | JSONB preferences |
| `event_logs` | Append-only, no client UPDATE/DELETE |
| `live_logs` | Operational: member_id, role, type, msg |

### Key enums
- `role_category`: `'root' | 'admin' | 'bridesmaid' | 'general'`
- `rsvp_mode`: `'open' | 'pool' | 'both'`

### Views
- `event_slugs` — returns only the `slug` column from `events`. Used for slug availability checks. `select("*")` and `select("slug")` are equivalent.

### Dropped tables (not needed for MVP)
`rsvp_logs`, `settings_logs`, `task_logs`

### Triggers written
- `touch_updated_at` — applied to all relevant tables
- `enforce_immutable_columns` — prevents mutation of locked fields

### Triggers remaining
- `prevent_hard_delete`
- `sync_required_when_hidden`
- `initialize_event_rows` — creates companion rows on event insert
- Analytics triggers

---

## Conventions

### File rules
- Single responsibility per file
- 150-line target, 250-line hard maximum
- `api.ts` — never imports from stores, never uses hooks, no side effects
- Components never import from `api.ts` directly — always through `queries.ts`

### Query conventions
- All queries keyed as `${slug}:${resource}`
- `enabled: !!eventId` gates every feature query — nothing fires before bootstrap resolves
- Read operations use `useQuery` (TanStack)
- Write operations use `useMutation` from `@/lib/query/useMutation` (custom wrapper)
- **Never import `useMutation` directly from TanStack in feature files** — always use the custom wrapper

### Mutation modes (src/lib/query/useMutation.ts)
Three exclusive modes — pick one per mutation:
1. **Simple toast** — `successMessage` + `errorMessage` strings (or functions)
2. **Promise toast** — `toast: { loading, success, error }` — Sonner promise style
3. **Silent** — `silent: true` — no automatic toast, handle feedback manually

**Bug fixed (this session):** In toast mode, `onSuccess` was silently swallowed due to an early `return`. Now `onSuccess` always fires first regardless of mode.

### Mutation rules
- Modals only close in mutation `onSuccess` — never on submit directly
- No hard deletes from the client — soft delete via `deleted_at` only
- Append-only tables (`live_logs`, all `*_logs`) — no client UPDATE or DELETE
- Analytics log tables — no client INSERT, written by DB triggers only

### Store conventions
Three Zustand stores — `useAdminStore`, `useModalStore`, `useCueStore`.
- `useAdminStore` — bootstrap context (slug, eventId, eventConfig, isBootstrapped), team, events, tasks, RSVPs, logs
- `useModalStore` — all modal open/close booleans and editing state
- `useCueStore` — activeCueEvent, notifiedEvents

### No inline Framer Motion variants in components
Import from `animations.ts` (lib or page-level). No variant objects defined inline in JSX.

### No hardcoded colours
Use CSS variable tokens only — `text-primary`, `bg-card`, `text-muted-foreground`, etc.

---

## Animation System

### Shared variants (src/lib/animations.ts)
- `container` — stagger parent
- `itemFadeIn` — opacity only
- `itemFadeUp` — opacity + y translate
- `fadeIn(delay)` — factory
- `fadeUp(delay, y, duration)` — factory
- `scaleIn` — opacity + scale
- `tabTransition` — for tab switches
- `pageTransition` — for page-level transitions (has `exit` state)
- `cardHover` — `whileHover` preset

### Wrappers
- `ComponentFade` — self-contained `motion.div` with `pageTransition` variants + `key` prop for AnimatePresence
- `ComponentSlide` — directional slide for wizard steps (direction: 1 | -1 | 0)
- `AnimateItem` — field-level error animation for forms

### AnimatePresence pattern
Always wrap state transitions in `<AnimatePresence mode="wait">`. Each child must have a unique `key` so Framer Motion treats state changes as unmount/mount cycles.

```tsx
<AnimatePresence mode="wait">
  {isLoading ? (
    <ComponentFade key="skeleton">...</ComponentFade>
  ) : !data?.length ? (
    <ComponentFade key="empty">...</ComponentFade>
  ) : (
    <ComponentFade key="content">...</ComponentFade>
  )}
</AnimatePresence>
```

This pattern is used in: **Dashboard** (skeleton → empty → events), **AuthGate** (login → admin), and any page with loading/empty/data states.

### Step transitions (wizard)
`ComponentSlide` handles direction-aware slide animations via the `Steps` / `useSteps` system. Direction is computed from step order index before navigating.

---

## create-event Page

Two-step wizard: **Step 1 (Event)** → **Step 2 (Role)** → submit via `create_event` RPC.

### File structure
```
src/pages/create-event/
├── index.tsx (or route entry)
├── types.ts
├── api.ts
├── queries.ts
├── hooks/
│   └── useSlugCheck.ts
├── components/
│   ├── CreateEventView.tsx    ← page shell, brand header, layout
│   ├── CreateEventForm.tsx    ← wizard shell, step state, submit
│   └── CreateEventStepper.tsx ← step indicator dots with check animation
└── steps/
    ├── StepEvent.tsx
    └── StepRole.tsx
```

### Slug system (useSlugCheck.ts)

Two exported transform functions:

**`toSafeSlug(input)`** — applied on every keystroke:
- Lowercase, convert non-`[a-z0-9-]` to dash, collapse consecutive dashes, strip leading dashes, collapse multiple trailing dashes to one but preserve a single trailing dash (user is mid-word)

**`toSlug(input)`** — applied on blur, submit, and programmatic generation:
- Everything `toSafeSlug` does + strip all trailing dashes

The `useSlugCheck` hook exports:
- `status: SlugStatus` — `"idle" | "checking" | "available" | "taken" | "error"`
- `scheduleCheck(slug)` — debounced (600ms), called on every keystroke with the `toSafeSlug`-transformed value. Shows spinner immediately when slug passes regex, fires network check after debounce.
- `checkNow(slug)` — immediate, cancels pending debounce. Called on every submit — always, no skip optimization (result could be stale if user AFK'd).
- `reset()` — returns to idle, used for programmatic slug changes (auto-generate from event name)

**Regex gate:** `SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/` — must pass before any network call fires. Keeps spinner away during mid-type states (`"my-"`, `"a"`).

**Stale result prevention:** `requestIdRef` increments before each request. Responses with a mismatched ID are silently discarded.

### StepEvent — key details

- **"Event URL" label** (not "URL Slug") — audience is brides and grooms, not developers
- **URL preview box** — shows live `hitchystitchy.com/{slug}/admin` and `hitchystitchy.com/{slug}` using `import.meta.env.VITE_BASE_URL ?? "hitchystitchy.com"`
- **Calendar** — `numberOfMonths={isMobile ? 1 : 2}` via `useIsMobile()`, `disabled={{ before: new Date() }}`
- **Date label** — shows year on `from` date only when from/to are in different years
- **Date parsing** — uses `new Date(y, m-1, d)` (local midnight) not `new Date(string)` (UTC midnight). Saves with `format(date, "yyyy-MM-dd")` from date-fns, not `.toISOString()`. Prevents off-by-one-day bug for users in non-UTC timezones (e.g. UTC+8).
- **Auto-generate slug** — derived from event name via `toSlug()` while `slugTouched === false`. Once user manually edits slug field, auto-generate stops.
- **Back navigation date bug fixed** — `defaultValues.date_end` loaded with `parseLocalDate()`, not wrapped in `addDays(..., 3)`.
- **Field sub-labels** — "Your Name — how you appear to your team", "Event Name — shown to guests on invitations"

### StepRole
- Radio grid: Bride / Groom / Coordinator / Other
- "Other" reveals a custom role input with collapse animation
- `role_short_name` auto-generated: `option.shortRole` for presets, `customRole.slice(0, 10)` for custom

### queries.ts
- Only `useCreateEventMutation` — uses custom `useMutation` from `@/lib/query/useMutation`, `silent: true`, navigates to `/:slug/admin` on success
- Slug checking is **not** a mutation — it lives entirely in `useSlugCheck.ts`
- No `console.log` in production code

### api.ts
- `getExistingSlug(slug)` — queries `event_slugs` view, returns `boolean`
- `createEvent(payload)` — calls `create_event` RPC
- `getFriendlyErrorMessage(error)` — maps Postgres constraint errors to human messages

---

## Dashboard Page

```
src/pages/dashboard/
├── api.ts          ← fetchUserEvents()
├── queries.ts      ← useEventsQuery, useCountEventsQuery
├── types.ts
└── components/
    ├── DashboardView.tsx
    ├── DashboardTopbar.tsx
    ├── DashboardHeader.tsx
    └── events/
        ├── EventWidget.tsx
        ├── EventView.tsx
        ├── EventEmptyState.tsx
        └── EventSkeletonCard.tsx
```

### State transitions — animated
```tsx
<AnimatePresence mode="wait">
  {isLoading ? (
    <ComponentFade key="skeleton">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </ComponentFade>
  ) : !events?.length ? (
    <ComponentFade key="empty"><EventEmptyState /></ComponentFade>
  ) : (
    <ComponentFade key="events"><EventView events={events} /></ComponentFade>
  )}
</AnimatePresence>
```

### Refresh with cooldown
`DashboardHeader` has a manual refresh button with a 10-second cooldown. Tracks `lastRefreshed` timestamp, updates `now` every second via `setInterval`. Refresh button disabled while `isFetching` or within cooldown window.

---

## Auth

```
src/auth/
├── index.tsx       ← SignIn form
├── AuthGate.tsx    ← Wraps protected routes, AnimatePresence between login/admin
├── queries.ts      ← useIsAuthenticatedQuery, useLoginMutation, useLogoutMutation, etc.
└── api.ts          ← getUser, loginUser, logoutUser, onAuthChange
```

`AuthGate` uses `AnimatePresence mode="wait"` with `ComponentFade` keyed as `"login"` / `"admin"` to animate the transition between unauthenticated and authenticated states.

---

## Invitation Page

```
src/pages/invitation/
```

- Completely independent of admin — no imports from `src/pages/admin/`
- Reads directly from Supabase using slug from URL params
- Guest identity: phone number stored in `localStorage`
- `cancel_token` (UUID) also in `localStorage` for cancellation verification
- Uses custom `useQuery`/`useMutation` primitives

---

## Key Invariants — Never Break These

- `api.ts` files never import from stores, never use hooks, never have side effects
- Components never import from `api.ts` directly — always through `queries.ts`
- `AdminModals.tsx` is the only place modals are rendered — imported once in `AdminPage`
- Modals only close in mutation `onSuccess` — never on submit directly
- `enabled: !!eventId` on every feature query — nothing fires before bootstrap
- Query keys always follow `${slug}:${resource}`
- No hard deletes from the client — soft delete only
- Append-only log tables — no client UPDATE or DELETE
- Analytics log tables — no client INSERT, DB triggers only
- Every table (except `event_members`) references `event_members.id`, not `auth.users.id`
- No inline Framer Motion variant objects in components — import from `animations.ts`
- No hardcoded colour classes — CSS variable tokens only
- File size: under 150 lines for most files, 250 maximum
- One responsibility per file
- Never use `.toISOString().split("T")[0]` for date storage — use `format(date, "yyyy-MM-dd")` from date-fns
- Never use `new Date("yyyy-MM-dd")` for local date parsing — use `new Date(y, m-1, d)`
- `useMutation` from `@/lib/query/useMutation` — never from TanStack directly in feature files

---

## Environment Variables

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_BASE_URL          ← e.g. "hitchystitchy.com" — used in slug URL preview
```