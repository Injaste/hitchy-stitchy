# Phase 2 — Timezone date parsing (low effort, high impact)

**Effort:** ~1 hour · **Impact:** high — event dates, countdowns and
active/past status render one day off for any user in a negative-UTC timezone
(Americas). Invisible from Singapore, which is why it has survived.

## The bug
`new Date("2026-06-10")` parses a **date-only** string as **UTC midnight**.
For a user at UTC-5 that instant is June 9, 19:00 local — every downstream
`format`/`startOfDay`/`differenceInDays` then operates on the wrong calendar
day. The codebase already has the correct helper — `parseLocalDate` at
`src/lib/utils/utils-time.ts:79-82` — these three functions in the *same file*
just don't use it:

| Function | Line | Symptom in UTC-negative zones |
|---|---|---|
| `formatDateRange` | `utils-time.ts:26-27` | dashboard/header shows "Jun 9" for a Jun 10 wedding |
| `getDaysUntil` | `utils-time.ts:42` | shows "Yesterday" on the wedding day itself |
| `getEventStatus` | `utils-time.ts:71-72` | event flips to past/active a day early |

## Fix
Replace `new Date(str)` with `parseLocalDate(str)` in those three functions.
The inputs are `events.date_start` / `date_end` (`date` columns → always
`"yyyy-MM-dd"` strings), so `parseLocalDate` is always safe there.

Then audit the rest of the repo for the same pattern on date-only values:

```
grep -rn "new Date(" src --include=*.ts --include=*.tsx
```

Known-safe cases (verified during review — do not "fix" these):
- `parseISO("yyyy-MM-dd")` (e.g. `DateField`, budget `dueInfo`) — date-fns
  parses date-only strings as **local** midnight; correct as-is.
- `new Date(rsvp_deadline)` — `timestamptz` arrives as ISO **with offset**;
  parses correctly.
- `new Date()` (now) — fine everywhere.
- `combineDeadline`/`parseDeadline` in the invitation config — verified
  correct round-trip; leave alone.

The risky shape is exactly `new Date(<"yyyy-MM-dd" string>)`.

## Verification
- Manual: run the dev server with a forced negative offset
  (`$env:TZ = 'America/New_York'; npm run dev` — Node respects TZ; spot-check
  the dashboard event card date, countdown, and status against an event dated
  today/tomorrow).
- `npm run build`.
