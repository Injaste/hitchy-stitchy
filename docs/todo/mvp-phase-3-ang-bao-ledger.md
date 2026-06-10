# MVP Phase 3 — Ang bao ledger

**Goal:** record cash gifts (ang bao / green packets) given at the wedding — who
gave, how much, which table — with a running tally and break-even vs cost-per-head.
**The SG/Asian wedding wedge no US tool (Zola/Joy/Knot) has or can easily copy.**

## Why it fits this app especially well
- The **ang bao table** is a real, named SG wedding job (a trusted helper logs
  packets at the reception entrance). Your **access model** lets you give that
  person a **scoped role** that can *only* record gifts and *cannot* see the rest
  of the event — and amounts stay hidden from everyone else.
- It ties straight into the existing **guest list** (`event_rsvps`) and pairs with
  phase-2 budget for the full money picture.

## SG shaping
- SGD; fast **mobile day-of entry** (helper standing at the door on a phone).
- Optional **table number** + **relationship** (colleague / relative / friend) for
  later reciprocation — couples carry these records to future weddings.
- Running total, count, average per packet, and **vs cost-per-head** (pull catering
  cost from phase-2 budget if present) to show break-even.
- **Walk-ins** common — gift rows must not require a matched guest.

## Data model (proposed — confirm in migration)
- `event_gifts`: `id`, `event_id` (FK, denormalised), `guest_id uuid NULL`
  (FK → `event_rsvps`, nullable for walk-ins), `giver_name text`,
  `amount numeric(10,2)`, `table_no text NULL`, `relationship text NULL`,
  `notes text NULL`, `recorded_by` (member), timestamps.

## Backend — sensitive data, gate harder
Follow the recipe, but **the SELECT RLS policy must NOT be plain `is_event_member`**
— amounts are sensitive. Gate read on `has_event_permission(event_id, 'gifts',
'read')` so only super-admins + an explicitly-granted role see them. RPCs
`record_gift` / `update_gift` / `delete_gift` guarded on the `gifts` resource.
New `gifts` resource: in `create_event`, default Admin `full`, **Team `none`**
(not `read`) — opt-in only. Migration + schema.sql sync.

## Frontend
- Feature folder `src/pages/admin/gifts/` mirroring `guests/`.
- **Two views:** a quick day-of "record packet" entry screen (big amount keypad,
  optional guest typeahead from RSVPs, table no.) and a ledger table with totals.
- Realtime so the couple watches the tally climb live (mirror `subscribeToGuests`).
- Route + sidebar nav gated on `canRead("gifts")`.

## Tier
**Pro** (a headline differentiator).

## Complexity
Medium. Lower than seating, highest differentiation per unit effort.

## Open decisions
1. **Privacy default** — confirm Team = `none` by default; only super-admins + the
   designated ang bao role get `gifts:read`. (This is the whole point — don't leak amounts.)
2. **Guest link** — soft link (typeahead, store both `guest_id` and snapshot name)
   vs require a matched guest. Leaning soft link + snapshot (walk-ins, renames).
3. **Packaging** with budget — see overview #2 (separate `gifts` vs shared `money`).
4. **Export** — CSV export of the ledger for reciprocation records (likely yes).

## Grounding
- Guest list it links to: `src/pages/admin/guests/`, table `event_rsvps`.
- Access/role scoping it leans on: `src/pages/admin/access/`, `has_event_permission` (schema.sql).
- Recipe + guardrails: [mvp-overview.md](mvp-overview.md).
