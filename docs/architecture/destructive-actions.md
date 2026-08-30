# Destructive actions

How deletes are gated, tiered by consequence.

- **Type-to-confirm** (shipped, high-stakes only) — the confirm button stays
  disabled until the user types the entity's name. Forces *reading* what's being
  destroyed (GitHub's "type the repo name"). It summons the mobile keyboard, so
  it's reserved for irreversible + content-bearing actions — never single rows.
- **Undo, not confirm** (shipped for status-flag flips) — a reversible action
  (archive, status change) acts immediately and offers Undo on the success
  toast instead of a confirm dialog first (L5,
  [ux-principles.md](ux-principles.md)). Never both on the same action.
- **Undo / soft-delete for hard deletes** (design kept below, not being
  pursued) — a grace period to reverse an actual DELETE. Designed in detail
  (see bottom) then explicitly shelved — not just for task delete (small,
  low-stakes, single-row, not worth the schema) but as a whole direction:
  hard deletes across the board stay immediate `useMutation` calls behind a
  confirm dialog for now. The design stays documented under "Shelved" below
  in case this gets revisited, but none of it is scheduled work.

> **Status:** type-to-confirm is live on **member** and **bulk guest delete**.
> (Not theme — `delete_theme` has no client UI at all; nothing triggers it
> today.) Immediate-with-undo is live on **task archive/restore** and **bulk
> guest status change**. Everything else is an immediate hard delete behind a
> plain confirm dialog, and stays that way — the soft-delete/undo path below
> is a shelved design, not an active plan.

## Tier per action

| Action | RPC | Reversible? | Type name (shipped) | Undo (shipped/shelved) |
|---|---|---|:--:|:--:|
| Delete guest(s) | `delete_guests` (bulk-capable; single delete calls it with a 1-element array) | no (hard) | ✅ | — (deliberately confirm-only — bulk scale raises the blast radius past what undo should paper over) |
| Delete task | `delete_task` | no (hard) | — | — (considered, dropped) |
| Delete timeline item | `delete_timeline` | no (hard) | — | — (designed, shelved) |
| Delete vendor | `delete_vendor` | no (hard) | — | — (designed, shelved) |
| Delete member | `delete_member` | re-invitable | ✅ | — (designed, shelved) |
| Delete theme | `delete_theme` | no (hard) | — (no client UI exists) | — (designed, shelved) |
| Archive tasks | `archive_tasks` | yes (flag) | — | ✅ shipped — immediate + undo toast |
| Bulk guest status | `update_guests` | yes (flag) | — | ✅ shipped — immediate + undo toast |
| Freeze member | `freeze_member` | yes | — | — (already reversible; kept as confirm — the dialog's copy is the only place that explains what freezing does) |
| Cancel RSVP | `cancel_rsvp` | re-RSVP | — | — (guest-facing, own modal) |

### Deferred (no client UI yet)

| Action | Tier when built |
|---|---|
| Delete event | type-name (event name) — needs a Settings *danger zone* first |
| Date-shorten → delete out-of-range day + contents | type-name (day label) + impact summary; offer "move to another day" first |

## Type-to-confirm mechanics (shipped)

Lives in [`ConfirmAlertModal`](../../src/components/custom/confirm-alert-modal.tsx)
via the optional `confirmPhrase` prop. **Match rule:** normalize *both* sides,
then compare equal — lowercase → strip punctuation/symbols (keep letters, digits,
spaces; Unicode-aware) → collapse whitespace. So `Sarah's Wedding!` is satisfied
by `sarahs wedding`. Forgiving of case/punctuation, but still forces typing the
words. The **id is never used** — a UUID would be copy-pasted (defeating the
read-it gate) and isn't shown to users. Focus stays on Cancel so the warning is
read before the keyboard appears.

## Shelved: server-side soft-delete + undo

Designed as the robust path (a prior client-side 7s-defer attempt was dropped:
tab close / crash / logout before the timer fired silently lost the delete),
then explicitly not pursued — kept here in case it's revisited, not as
in-progress or scheduled work. The design:

- **`deleted_at timestamptz`** column per table. Soft-delete commits immediately
  on confirm — durable, so close/crash/logout no longer lose it.
- **Per-table RPC pairs** `soft_delete_x` / `restore_x` (frontend-callable, carry
  the authz — which is genuinely per-table: task creator-override, member rank /
  super-admin protections, theme uses the `invitation` resource — so *not* a
  generic `soft_delete(table, …)` with dynamic SQL).
- **Internal purge**: the existing `delete_x` RPCs become reaper-only — strip the
  auth checks (cron has no `auth.uid()`), keep the cascade — and have their
  `EXECUTE` revoked from `anon`/`authenticated` (or move to an unexposed schema).
- **pg_cron reaper**: a per-row loop (`BEGIN … EXCEPTION` = subtransaction per
  row, so one poison row can't block the batch) calling the internal purge. Run
  hourly; the cascade (e.g. stripping a member out of task/timeline `assignees`)
  happens here at purge, **not** at soft-delete, so Undo is lossless.
- **Filter `deleted_at IS NULL`** on every read: admin fetches, RLS, count RPCs,
  guest-facing pages, and **realtime** handlers (a soft-delete arrives as an
  UPDATE, not a DELETE — must be treated as removal; restore as re-add).
- **Partial unique indexes** `… WHERE deleted_at IS NULL` so a lingering
  soft-deleted row doesn't block re-creating the same member/theme.
- **Member gotcha**: `event_members` is access-bearing. `get_current_member` /
  `has_event_permission` must treat `deleted_at` like the existing `frozen_at`,
  or a "deleted" member keeps access until the reaper runs.

Client side, this collapses to two ordinary `useMutation` calls (`softDelete` +
`restore`) with an undo toast — no client timer — so it rides the
[mutations](mutations.md) convention cleanly.
