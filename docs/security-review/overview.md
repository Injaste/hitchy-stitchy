# Security & Correctness Review — overview

Findings from the full-codebase review (2026-06-10): 7 domain sweeps over all of
`src/` + `supabase/`, every candidate hand-verified against the actual code.
Each phase has its own file (`phase-N-*.md`), sized to pick up cold.
**Phases are numbered in recommended execution order — work them top to
bottom.** Severity-first, with one dependency: phase 6 (live-DB hardening)
needs phase 4 (schema dump) done first.

> Status: phases 2/3/4/6 remain. `npm run build` passes; tasks + timeline domains
> came back clean; access gating (`useAccess()`) is enforced everywhere.

## Execution order

| Phase | Title | Effort | Why this slot |
|---|---|---|---|
| 2 | [Timezone date parsing](phase-2-timezone-date-parsing.md) | low (~1 h) | High impact (wrong dates/status for any negative-UTC user), nearly free — the correct helper already exists in the same file. |
| 3 | [Hygiene & naming](phase-3-hygiene-and-naming.md) | trivial (~30 min) | Low impact, zero risk. Clears the rule violations and maintenance traps while the repo is fresh in mind. |
| 4 | [Schema source of truth](phase-4-schema-source-of-truth.md) | medium (needs live DB access) | High — repo lies about the core permission function; also a hard prerequisite for phase 6. |
| 6 | [Permission hardening](phase-6-permission-hardening.md) | high (live migration + full permission-matrix regression) | Medium likelihood / **high blast radius** — defense-in-depth on the live access system; not exploitable today without a second bug, so it goes last, done carefully. |

## What was checked and found clean (don't re-litigate)
- **tasks/ + timeline/** — full sweep, zero findings (drag/position engine,
  optimistic cache updates, segment reordering all correct).
- **Slug availability logic** — behavior is correct; only the *name* is inverted
  (phase 3).
- **RSVP deadline timezone round-trip** (`combineDeadline`/`parseDeadline`) —
  convoluted but correct against `timestamptz`.
- **Create-event date range** — react-day-picker `mode="range"` cannot produce
  `end < start`; the backward-`generate_series` worry is unreachable.
- **Home-page mock animations** — no timer leaks (single self-rescheduling
  chain, cleanup clears the live timeout).
- **`DateField`** — `parseISO("yyyy-MM-dd")` is *local* midnight in date-fns;
  fine. (Unlike `new Date("yyyy-MM-dd")` — that's phase 2.)
- **Budget migration `create_event` re-paste** — verbatim vs the previous
  version, only the two intended additions; backfill covers the migration window.
- **"RPC not defined" alarms** for `invite_member`, `update_invitation`,
  `delete_member`, `claim_member_invite`, etc. — false; they're in the
  known-undumped list at `supabase/schema.sql:940-948`. The two *genuinely*
  undocumented ones (`get_rsvp`, `get_user_events`) are phase 4.
