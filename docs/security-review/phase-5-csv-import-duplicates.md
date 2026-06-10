# Phase 5 — CSV import: intra-batch duplicate phones (medium)

**Effort:** medium (~half day) · **Impact:** medium — a bulk guest import that
passed preview fails at submit with a raw constraint error, after the admin
has already reviewed and approved the rows.

## The bug
`resolveRows` in
`src/pages/admin/guests/modals/import/ImportPreviewStep.tsx:29-47` builds its
conflict map **only from existing guests**:

```ts
const byPhone = new Map<string, Guest>()
existing?.forEach((g) => byPhone.set(g.phone.trim(), g))
```

Two CSV rows sharing a phone number (common in merged household lists) both
resolve to `action: "insert"`. Guests live in `event_rsvps`, which has
`UNIQUE (event_id, phone)` (`supabase/schema.sql:287`) — so the second insert
violates the constraint. Whether the *whole* batch fails depends on the
`create_guests` RPC body, which is not in the repo (see
[phase 4](phase-4-schema-source-of-truth.md)); either way the admin gets a
failure the preview said wouldn't happen.

## Fix
1. In `resolveRows`, track phones seen **within the parsed batch**: the second
   (and later) occurrence of a phone gets a new resolution kind — e.g.
   `conflictWith: null, action: "skip"`, plus a flag like
   `duplicateInFile: true` so the preview table can show a distinct badge
   ("Duplicate row in file") instead of the existing-guest conflict styling.
2. Decide the row-level affordance: allow the admin to flip which duplicate
   wins (keep-first vs keep-last), or keep it simple — first wins, rest are
   skipped with the badge. Simple is fine for now.
3. Normalize before comparing: the existing map uses `.trim()` only — make the
   intra-batch check use the same normalization as the parser so
   `"+65 9123 4567"` and `"+6591234567"` don't slip through as "different"
   if the parser treats them as equal. Match whatever `ParsedGuestRow`
   normalization already does; don't invent a new phone normalizer here.
4. While in this file, fold in the deferred intent from the deleted TODOs at
   `src/pages/admin/guests/api.ts:144-145` (smart insert-vs-update on import)
   as a `docs/todo/` entry if it isn't one already — it is the larger version
   of this same problem.

## Verification
- Unit-style check via the preview UI: import a CSV with (a) a phone matching
  an existing guest, (b) the same new phone twice, (c) a unique new phone.
  Preview must show: conflict badge, duplicate-in-file badge, clean insert —
  and the submitted batch must contain only (c) + the first of (b) if
  keep-first is chosen.
- Confirm the import completes with no constraint error and the counts in the
  result summary match.
- `npm run build`.
