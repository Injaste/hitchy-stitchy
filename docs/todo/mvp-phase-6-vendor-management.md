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
  contact_phone, contact_email, notes, timestamps`. No cost/deposit/balance, no
  `created_by`, no `day_id`.
- **`event_expenses`** — add `vendor_id uuid → event_vendors(id) ON DELETE SET
  NULL` (deleting a vendor unlinks its expenses, keeps them). Existing free-text
  `vendor_name` stays as a fallback for un-linked expenses.
- A vendor's **cost / paid / balance is derived** from its linked expenses (live
  sum), never stored. Edit an expense → the vendor's total updates automatically.

### Build (gist)
0. Remove the phantom `event_vendors` still in `schema.sql` (dropped from the DB,
   never removed from the snapshot).
1. Migration: `event_vendors` + RLS SELECT (no write policies); `vendor_id` on
   `event_expenses`; RPCs `create_/update_/delete_vendor`; add `p_vendor_id` to
   `create_/update_expense`; seed `vendors` into `event_resources`.
2. Sync all of the above into `schema.sql`.
3. Feature folder `src/pages/admin/vendors/` mirroring `gifts/` (DataTable,
   realtime, modal store).
4. Budget side: vendor picker in the expense modal; vendor name on expense rows.
5. Access: `vendors` resource in `access/types.ts`; route + sidebar.
6. Query keys; `npm run build`.

### Settled during the mockup
- **Tier** — super-admin-only (the couple's private list). The FE gates on
  `RequireAccess requireSuperAdmin`, deliberately *not* a `vendors` resource or
  plan feature: those get defined with the migration. Loosening it later is a
  one-line RLS change.
- **Category** — a fixed SG list (photographer / venue / catering / bridal /
  makeup / emcee / music / florist / transport / others) rendered via
  `categoryMeta`, which falls back gracefully for any unknown value — so a switch
  to free-text later costs nothing.
- **No `created_by`** — vendors are super-admin-only, so the creator is always
  one of 2–3 people and the attribution carries no information. Matches the
  convention (`created-by-convention.md`): only where functionally used.

### Deferred — pick up when the migration lands
- **Access group naming.** `RESOURCE_GROUPS` in `access/types.ts` still labels
  members + access as **"Team"** (the sidebar now calls the same grouping
  **"People"**, since vendors joined it). Revisit when vendors becomes a real
  `Resource` with its own access convention — that's the moment the access page
  can group it honestly, rather than renaming to "People" while listing no
  vendors.
- **Getting-started tutorial** — add vendors to the setup guide
  (`src/pages/admin/setup-guide/`).

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
