# Phase 3 — Hygiene & naming (trivial)

**Effort:** ~30 min · **Impact:** low — these are maintenance traps and
violations of the project's own cleanliness rules, not runtime bugs.
Everything here is mechanical; no behavior should change except where noted.

## 1. Misleading function name: `checkSlugAvailable` returns "taken"
- `src/pages/dashboard/api.ts:29-37` — returns `data.length > 0`, i.e. **true
  when the slug EXISTS**. Callers in `src/hooks/useSlugCheck.ts:60-62` and
  `:79-81` read it as `exists`, so behavior is currently correct — but the next
  caller who trusts the name ships the inverted bug.
- **Fix:** rename to `checkSlugExists` (or flip the return and keep the name).
  Two call sites, both in `useSlugCheck.ts`.

## 2. Committed `// TODO`s (rule: use `docs/todo/`, never inline)
Move the intent into `docs/todo/` (or delete if stale), then remove the comment:
- `src/pages/admin/guests/api.ts:144-145` — smarter CSV import / upsert logic
  (overlaps with [phase 5](phase-5-csv-import-duplicates.md); fold it in there).
- `src/components/custom/form/fields/PasswordField.tsx:76` — autofill overlay
  rendering outside the group boundary.
- `src/pages/admin/budget/components/ExpenseRow.tsx:27` — "why arent u using
  shadcn components like badge?" (either switch `PayerChip` to `Badge` or
  delete the comment).
- `src/pages/wedding/templates/unique-muslim/types.ts:102` — native image
  upload for the field renderer.
- `src/pages/admin/sidebar/components/AdminSidebarContent.tsx:39` — "tie these
  to RESOURCE_GROUPS in /access/types.ts?" (uncommitted as of the review; a
  legitimate idea — sidebar groups are hand-synced with `RESOURCE_GROUPS` in
  `src/pages/admin/access/types.ts` and will drift — but it belongs in
  `docs/todo/`, not the component).

## 3. `console.error` in committed code
- `src/pages/home/components/ShareRow.tsx:23` — clipboard-copy failure logs to
  console. Replace with a toast (or drop silently); rule is no `console.*` in
  committed files.

## 4. Dead prop: `BudgetHeader` receives `data` and never uses it
- `src/pages/admin/budget/components/BudgetHeader.tsx:15-17` declares
  `data?: BudgetData`; the component never reads it. `src/pages/admin/budget/index.tsx:14`
  passes it. Delete both ends.

## 5. Inaccurate migration comment: "mirrors event_rsvps_select"
- `supabase/migrations/2026/06/10/20260610000001_budget_tracker.sql` (§2 header comment)
  and the copy in `supabase/schema.sql` claim the budget SELECT policies mirror
  `event_rsvps_select` — but that policy (`schema.sql:712-714`) checks
  `is_event_member` only, **no** permission gate. The budget policies are
  intentionally stricter. Reword to "SELECT-only RLS + writes via RPCs, like
  event_rsvps; additionally gated on budget:read" so future readers don't
  copy the wrong precedent.

## 6. Budget inline editor: no upper bound (small UX guard)
- `src/pages/admin/budget/components/BudgetSummary.tsx` `commit()` (~line 75)
  accepts any digit string. The expense form caps amounts at `99_999_999`
  (`src/pages/admin/budget/types.ts:30-37`); the budget editor doesn't, so a
  13+-digit entry reaches `numeric(12,2)` and surfaces a raw Postgres
  "numeric field overflow" toast. Clamp/validate to the same max before
  calling `setBudget.mutate`. While there: typing `0` sets an S$0 budget
  (immediately "over"); decide whether `0` should mean "clear" like the empty
  string does.

## Verification
- `npm run build` (rule: build, not just tsc).
- `grep -rn "// TODO\|console\." src --include=*.ts --include=*.tsx` → only
  allowed hits remain.
