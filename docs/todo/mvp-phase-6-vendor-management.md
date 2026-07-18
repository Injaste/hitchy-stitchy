# MVP Phase 6 — Vendor management

Rebuild of vendors (dropped in `20260605000002_drop_unimplemented_features`),
split into two independent facets. **Facet 1 (CRM) is this phase. Facet 2 (vendor
login) is deferred** to the Advanced/monetization work — it's the heaviest change
on the roadmap and shares its engine with per-day RSVP + per-day guest lists.

## Facet 1 — Vendor CRM (this phase) · Pro

A couple-side directory of who they hired. The vendor is a **contact card**;
**money stays in Budget** — no cost fields on the vendor, so there's nothing to
keep in sync. The two correlate via `vendor_id`.

### Data
- **`event_vendors`** — contact only: `id, event_id, name, category,
  phone, email, notes, timestamps`. No cost/deposit/balance, no
  `created_by`, no `day_id`.
- **`event_expenses`** — add `vendor_id uuid → event_vendors(id) ON DELETE SET
  NULL` (deleting a vendor unlinks its expenses, keeps them). Existing free-text
  `vendor_name` stays as a fallback for un-linked expenses.
- A vendor's **cost / paid / balance is derived** from its linked expenses (live
  sum), never stored. Edit an expense → the vendor's total updates automatically.

### Build — A and B done, C outstanding
Split by risk, so the safe part could land on its own:

- **A · Make it real — DONE** [`20260717000001`]. Phantom `event_vendors` removed
  from `schema.sql` — it had survived the 20260605000002 drop still carrying an
  `is_event_member` SELECT policy, i.e. the snapshot claimed the whole team could
  read vendors. Real table + super-admin RLS + `create_/update_/delete_vendor`;
  `api.ts` swapped off the mock, `data/` deleted. Additive only — no live RPC
  touched. Driven end-to-end against Supabase.
- **B · Access + plan wiring — DONE** [`20260718000001`–`8`, one SQL per function].
  The tier moved from super-admin-only to **delegated**: **Admin = full, Team =
  none** (hardcoded — the access groups are fixed/read-only anyway). So unlike
  gifts/budget (couple-only, granted to nobody), `vendors` is keyed into the Admin
  permissions JSON like `guests`/`invitation`: `create_event` seeds it + a backfill
  grants existing Admin groups; RLS + write RPCs move onto
  `has_event_permission('vendors',…)`; a `vendors` `event_resources` catalog entry
  lists it in the access matrix. Plan side: a **Pro** feature (`can_use_vendors`,
  Pro+), wired through `plan_within_limits` / `get_bootstrap_context` /
  `assert_plan` (create+update; delete stays ungated). FE: route →
  `RequireRoute resource="vendors" feature="vendors"`; sidebar/header/detail →
  `canRead`/`canCreate`/`canEdit`; `Resource` + `PLAN_FEATURES` + `FEATURE_META`
  gain `vendors`; the access-matrix group renamed **Team → People** (members +
  vendors + access).
- **C · Budget link — TODO, and the only part behind the hard gate.** `vendor_id`
  on `event_expenses` means `CREATE OR REPLACE` on the live `create_expense` /
  `update_expense`. Kept separate so A and B don't inherit that risk.

### Settled during the mockup
- **Tier** — *(superseded by Build B)* began super-admin-only; the couple later
  chose **Admin = full, Team = none** + a **Pro** feature gate. Now a delegated,
  Pro-gated resource — see Build B.
- **Category** — a fixed SG list (photographer / venue / catering / bridal /
  makeup / emcee / music / florist / transport / others) rendered via
  `categoryMeta`, which falls back gracefully for any unknown value — so a switch
  to free-text later costs nothing.
- **No `created_by`** — *reconsider, now that Build B delegated vendors to the
  Admin group.* The original rationale (creator is always the couple → no info)
  weakens: an event can have several Admins, so "who added this vendor" now
  carries information. Still deferred (the column doesn't exist and nothing needs
  it yet), but it's no longer a clear-cut drop. `VendorDetailModal`'s History
  shows *when*, not *who*.

### Deferred
- **Access group naming — DONE with B.** `RESOURCE_GROUPS` now labels the grouping
  **"People"** (members + vendors + access), matching the sidebar.
- **Getting-started tutorial** — add vendors to the setup guide
  (`src/pages/admin/setup-guide/`).

### Found while building — outside this phase
- **`FieldShell` labels aren't associated with their controls.** Verified live:
  `input.labels.length === 0`, no `id`/`htmlFor`, no `aria-label`, and the label
  is a sibling rather than a wrapper. So clicking a label doesn't focus its
  field, and a screen reader announces the input with no name — across **every**
  admin form, not just vendors. Fix is one place: `FieldShell` mints a `useId()`,
  passes `id` to the control and `htmlFor` to `FieldLabel` (and the same trick
  wires `aria-describedby` to the description/error). Deliberately *not* a `name`
  attribute — TanStack Form owns the value, so a native `name` would be dead
  weight.
- **Combobox hidden input serialises the whole item.** The country picker's
  hidden input holds `{"code":"MY","name":…}` because `PhoneField` gives
  `Combobox` no `itemToStringValue`. Harmless today (nothing submits natively);
  `itemToStringValue={(c) => c.code}` fixes it.
- **Drag on a task card is unverified** after the whole-card hit-button
  migration (`e9513df`) — dnd-kit's pointer activation doesn't respond to
  synthetic drags, so it needs one real drag by hand.

## Facet 2 — Vendor day-scoped login (deferred) · Advanced

Vendors log in and see **only their booked day(s)**, enforced server-side. Their
**own access group** — the ladder becomes superadmin → admin → team → **vendor**
(not merged into Team: Team is event-wide, a vendor is near-zero + day-scoped).

**Link, don't merge.** Most vendors never log in — the florist is a phone number,
not a user account. So `event_vendors` (a CRM record that exists regardless) and
`event_members` (someone who can authenticate) stay separate tables joined by a
nullable **`event_vendors.member_id → event_members(id)`**:
- `NULL` — the 95% case: a contact card, no member row, no invite, no cost.
- Set — you invited them to collaborate; a member row exists in the Vendor group.

That keeps the invite/auth engine exactly where it is (members) instead of
duplicating it onto vendors, and avoids dead member rows for people who'll never
sign in. The Members roster filters the Vendor group out; the vendor's detail
modal shows the state (*Not invited → Invited → Joined*).

Deferred because it introduces a **per-member day-allowlist read dimension** that
exists nowhere yet and is shared with per-day RSVP links + per-day guest lists.
Build that scoping engine **once**, across all three, when Advanced is greenlit —
not for vendors alone.

## Grounding
- Dropped table + phantom stub: `schema.sql` (event_vendors), migration
  `20260605000002_drop_unimplemented_features.sql`.
- Pattern to mirror: `src/pages/admin/gifts/` (super-admin money feature).
- Budget link target: `src/pages/admin/budget/`, `event_expenses`.
- Recipe + guardrails: [mvp-overview.md](mvp-overview.md).
