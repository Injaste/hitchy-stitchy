# MVP Phase 6 — Vendor management

**Goal:** bring vendors back (they were dropped in migration
`20260605000002_drop_unimplemented_features`) as a **day-scoped rebuild**, per the
[payments handoff](../payment-plans/phase-1.md). Two facets:
1. **Vendor CRM (couple-side)** — contacts, contracts, payments; ties to Budget + Timeline.
2. **Vendor collaborators (Advanced)** — vendors as **day-scoped members** who log in
   and see only their day(s), enforced server-side.

## Facet 1 — Vendor CRM (do first)
A couple-side directory of who's hired: name, category (photographer, banquet,
florist, emcee, bridal studio…), contact, contract/cost, deposit + balance, notes.
- Links to **Budget** (a vendor's costs become `event_expenses` rows / a vendor_id
  on expenses) and **Timeline** (a vendor can be a segment/item assignee).
- Data: `event_vendors` (rebuild — the schema stub has unknown columns; define
  fresh): `id`, `event_id`, `name`, `category`, `contact_phone`, `contact_email`,
  `cost numeric`, `deposit numeric`, `notes`, timestamps.
- Recipe-standard gated feature: new `vendors` resource, RPCs
  `create_vendor`/`update_vendor`/`delete_vendor`. Migration + schema.sql sync.

## Facet 2 — Vendor day-scoped access (Advanced)
The differentiator from the payments handoff: a vendor logs in and sees **only the
day(s) they're booked for**.
- Model (per handoff §3): vendors are **`event_members` in a "Vendor" access
  group**, with a **day allowlist**, enforced **server-side** (RLS/RPC) — *not* a
  client filter. Reuses members + the access engine; the day is a filter dimension,
  not a context switch.
- Needs: a Vendor access group seed, a `member ↔ day` allowlist table
  (`event_member_days` or similar), and RLS/RPC changes so day-scoped members only
  read rows for their allowed `day_id`s across timeline/segments/etc.
- **Heaviest, most cross-cutting part** — touches the access model's core. Plan it
  separately; ship Facet 1 first.

## Tier
Facet 1 (CRM): Pro. Facet 2 (day-scoped vendor login): **Advanced** (the
single-day vs multi-day lever from the handoff).

## Complexity
Facet 1: medium. Facet 2: medium–high (server-side day scoping across tables).

## Open decisions
1. **CRM vs collaborator first** — confirm Facet 1 first (lower risk, immediate value).
2. **Vendor ↔ budget link** — `vendor_id` FK on `event_expenses`, or keep budget's
   free-text `vendor_name` and link later. Leaning add `vendor_id` when this lands.
3. **Day allowlist model** — new join table vs an array column on `event_members`.
4. **RLS reach** — which resources day-scoped vendors may read (timeline only? tasks?).

## Grounding
- Dropped tables / current stub: `event_vendors` (schema.sql §event_vendors — stub), migration `20260605000002_drop_unimplemented_features.sql`.
- Access engine to extend: `src/pages/admin/access/`, `event_members` + `event_access_groups`, `has_event_permission` / `get_current_member` (schema.sql).
- Day spine: `event_days` / `event_segments`.
- Budget + timeline links: `src/pages/admin/budget/` (phase 2), `src/pages/admin/timeline/`.
- Recipe + guardrails: [mvp-overview.md](mvp-overview.md).
