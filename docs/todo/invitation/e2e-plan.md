# E2E Test Plan — Invitation → Guests → RSVP

Living checklist for the private-RSVP work (`feat/invitation-private-mode`).

## Ground rules (from the server code)

- **Capacity** = `SUM(guest_count) WHERE status <> 'cancelled'`, per page. `max_guests = NULL` ⇒ no cap. Reserved **pending** seats already count (held). Claiming a reserved row re-checks capacity **excluding self**.
- **Code match is case-insensitive** (`upper(code) = upper(private_code)`). Stored only for `private`/`both`; forced `NULL` on `public`.
- **Phone normalized** server-side (all whitespace stripped) before match/dedup. Dedup is **per page** (`invitation_id`).
- **Reserved identity** = `source = 'private'` row on that page. A `public`-source row is not claimable as reserved.
- A page must be **published + event active**, else public calls return `"Invitation not found"`.

## Execution layers

| Layer | How | Covers |
|---|---|---|
| L1 — RPC (admin) | `preview_eval` → `import('/src/lib/supabase.ts')` | server guards, capacity, dedup, atomicity |
| L2 — RPC (anon) | `submit_rsvp` granted to `anon` | gate logic without the form |
| L3 — Admin UI | real browser | create/edit/duplicate/move modals, defaults, bounds errors |
| L4 — Public UI | real browser, logged-out (+ `?private=true`) | form variant per mode, code field, closed/deadline msg |
| L5 — RPC error sweep | `preview_eval`, assert every thrown message | all edge cases return the expected error string |

Standing rules: **do not delete test rows** — report + leave for inspection. L3/L4 driven in a **real browser** (synthetic Radix clicks unreliable — flag, don't conclude).

---

## Phase 0 — Setup fixture

Three pages on one day so all modes coexist:

- [ ] `PUB` — public, `max_guests=10`, min 1 / max 5, message hidden, deadline far future, published.
- [ ] `PRI` — private, `private_code=LOVE25`, `max_guests=6`, min 1 / max 4, published.
- [ ] `BOTH` — both, `private_code=BOTH25`, `max_guests=8`, min 1 / max 4, published.

Reserved guests (admin, `source=private`, `status=pending`):

- [ ] `PRI`: "E2E Reserved A" `+60111111111` ×2; "E2E Reserved B" `+60122222222` ×2.
- [ ] `BOTH`: "E2E VIP C" `+60133333333` ×2.
- [ ] Assert `private_code` is **never** present in `get_public_invitation` output.

---

## 1. Public

### 1.1 Invitation (admin)
- [ ] Mode → public wipes `private_code` to NULL.
- [ ] public → private with no code → rejected ("A private code is required…").
- [ ] `guest_count_max < min` → rejected.
- [ ] Preview reflects public form without publish/save.

### 1.2 Guests (admin)
- [ ] Create on `PUB`: source default = Public, status pending.
- [ ] Party-size outside 1–5 → inline error + RPC rejects.
- [ ] Phone dedup on `PUB` → second same-phone rejected.
- [ ] Multi-page create `PUB`+`BOTH` (compatible) → 2 rows atomic.
- [ ] Multi-page where one page's phone is taken → whole create rolls back (0 rows).

### 1.3 RSVP (public path)
- [ ] Fresh phone, in-bounds → inserts source=public, confirmed.
- [ ] Duplicate (same phone, not cancelled) → "already submitted".
- [ ] Cancelled then re-RSVP → reactivates same row (no new row).
- [ ] Count `>max` / `<min` → bounds errors.
- [ ] Capacity: fill to 10, next → "reached maximum capacity".
- [ ] Deadline in past → server "deadline has passed"; UI shows closed message.
- [ ] Unpublished page → "Invitation not found".

---

## 2. Private

### 2.1 Invitation (admin)
- [ ] Mode=private requires code (Generate fills it). Empty/whitespace → rejected.
- [ ] Code persists; not leaked in public payload.
- [ ] PrivateShareBlock: share link + editable invite_message; `?private=true` link.

### 2.2 Guests (admin)
- [ ] Create on `PRI`: source default = Reserved, status pending.
- [ ] Bounds 1–4 enforced; phone dedup per page.
- [ ] ⚠️ EDGE: picking Public source on a private page → un-RSVP-able row. (flag)
- [ ] ⚠️ EDGE: reserved guest with no phone → can never self-claim. (flag)

### 2.3 RSVP (private path, `?private=true`)
- [ ] Correct phone + code (try lowercase) → pending → confirmed, confirmed_at set.
- [ ] Wrong/missing code → "Invalid invite code".
- [ ] Code right, phone not on list → "This phone number is not on the guest list".
- [ ] Capacity excl-self: claim held seat near max OK; party-size increase breaching max → capacity error.
- [ ] Re-submit confirmed reserved phone → re-confirms, no new row.
- [ ] Private page UI offers only the gated form (no public branch).

---

## 3. Both

### 3.1 Invitation (admin)
- [ ] Mode=both requires code (same guard).
- [ ] Public link AND `?private=true` link (CopyLinksMenu).

### 3.2 Guests (admin)
- [ ] Create on `BOTH`: source default = Reserved; Public is valid here.
- [ ] Table shows source icon only on `both` pages.

### 3.3 RSVP (branching)
- [ ] Reserved phone + code (`?private=true`) → claims pending → confirmed.
- [ ] Reserved phone, public form, no code → "open your private invite link to confirm".
- [ ] Reserved phone + wrong code → same guidance.
- [ ] Non-reserved phone, public form → public insert.
- [ ] Non-reserved duplicate → "already submitted".
- [ ] Capacity across mixed held + public rows respects single per-page sum.

---

## 4. Cross-cutting / integrity

- [ ] Atomicity: multi-page create failing on page N → 0 rows.
- [ ] Move (edit): re-validates bounds + dedup against target; blocked move leaves origin unchanged.
- [ ] Copy/Duplicate to pages: same guest → separate rows per page (same phone allowed across pages).
- [ ] Realtime: public RSVP appears in admin table without refresh.
- [ ] Permission/active guards: each RPC rejects without permission / inactive event.
- [ ] No `invite_code` anywhere (column gone, no RPC references).

---

## 5. RPC error-assertion sweep (after UI pass)

Direct RPC calls asserting the **exact thrown message** for every guard:

- [ ] `submit_rsvp`: not found / inactive / missing name / missing phone / missing count / deadline passed / count<min / count>max / message required / invalid code (private) / not on list (private) / capacity (private) / both-guidance / both capacity / public duplicate / public capacity.
- [ ] `update_invitation`: not found / not member / no permission / max<min / code required.
- [ ] `create_guest_on_pages`: not member / no permission / no pages / no name / count<min / count>max / phone dup on page.
- [ ] `update_guest`: not found / wrong event / not member / no permission / count bounds on target / phone dup on target.
