# E2E / UAT Results — Invitation → Guests → RSVP

Fixture: event **Edge Case Wedding** (`edge-case-test`), day 2026-06-29.
Layers: **L1** admin RPC · **L2** anon/public RPC · **L3** admin UI · **L4** public UI · **L5** RPC error sweep.

| Page | URL | Mode | Code | Cap | Bounds |
|---|---|---|---|---|---|
| Reception | `/edge-case-test/reception` | public | – | 60 | 1–6 |
| Nikah | `/edge-case-test/nikah` | private | NIKAH26 | 8 | 1–4 |
| (root) | `/edge-case-test` | both | WALIMA26 | 10 | 1–4 |

---

## Phase 0 — Fixture setup (L1)

| ID | Action | Expected | Actual | Result |
|---|---|---|---|---|
| F0.1 | Delete all 9 pre-existing RSVP rows via `delete_guest` | 0 rows remain | 9 deleted, 0 remain | ✅ |
| F0.2 | Reconfigure + publish 3 pages via `update_invitation` | modes/codes/caps/bounds set, published | all 3 published, values correct | ✅ |
| F0.3 | Load 6 realistic guests via `create_guest_on_pages` | reserved pending/confirmed + 1 public | all 6 created with right source/status | ✅ |
| F0.4 | `get_public_invitation` for all 3 link-slugs | `private_code` never present | no code key, codes absent in all 3 payloads | ✅ |

## Phase 1 — Public RSVP (L2, `submit_rsvp` @ Reception)

| ID | Action | Expected | Actual | Result |
|---|---|---|---|---|
| P1 | Fresh phone, count 2 | insert source=public, confirmed | public/confirmed | ✅ |
| P2 | Same phone again | block: already submitted | "You have already submitted an RSVP. Please contact the event organiser for changes" | ✅ |
| P3 | Count 7 (>max 6) | block: cannot exceed | "Guest count cannot exceed 6" | ✅ |
| P4 | Count 0 (<min 1) | block: at least | "Guest count must be at least 1" | ✅ |
| P5 | Cancel row, re-RSVP same phone count 3 | reactivate SAME row, confirmed | id match=true, confirmed, count=3 | ✅ |
| P6a | Cap=4, sum=3, submit 2 | block: capacity | "Sorry, this event has reached maximum capacity" | ✅ |
| P6b | Cap=4, sum=3, submit 1 (=cap) | success | confirmed, count=1 | ✅ |

## Phase 2 — Private RSVP (L2, `submit_rsvp` @ Nikah, code NIKAH26)

| ID | Action | Expected | Actual | Result |
|---|---|---|---|---|
| PR1 | Reserved phone + **lowercase** code `nikah26`, count 2 | claim pending→confirmed, confirmed_at set | id match=true, confirmed, confirmed_at set | ✅ |
| PR2 | Reserved phone + wrong code | block: invalid code | "Invalid invite code" | ✅ |
| PR3 | Reserved phone + no code | block: invalid code | "Invalid invite code" | ✅ |
| PR4 | Correct code, phone not reserved | block: not on list | "This phone number is not on the guest list" | ✅ |
| PR5 | Cap=5, claim Ahmad count 3 (others=3 → 6) | block: capacity | "Sorry, this event has reached maximum capacity" | ✅ |
| PR6 | Cap=5, claim Ahmad count 2 (others=3 → 5=cap) | success (excl-self) | confirmed, count=2 | ✅ |
| PR7 | Re-submit already-confirmed reserved phone | idempotent, no new row | id match=true, rows=1, confirmed | ✅ |

## Phase 3 — Both RSVP (L2, `submit_rsvp` @ root, code WALIMA26)

| ID | Action | Expected | Actual | Result |
|---|---|---|---|---|
| B1 | Reserved phone, public form (no code) | block: use private link | "You're on the guest list — open your private invite link to confirm" | ✅ |
| B2 | Reserved phone, wrong code | block: use private link | same guidance message | ✅ |
| B3 | Reserved phone + correct code | claim SAME private row | id match=true, private/confirmed | ✅ |
| B4 | Non-reserved phone, public form | public insert | public/confirmed | ✅ |
| B5 | Non-reserved duplicate | block: already submitted | "You have already submitted an RSVP…" | ✅ |
| B6a | sum=7, submit 4 (>cap 10) | block: capacity | "Sorry, this event has reached maximum capacity" | ✅ |
| B6b | sum=7, submit 3 (=cap 10) | success | public/confirmed, count=3 | ✅ |

**RPC core: 25/25 pass (4 setup + 21 RSVP).**

---

## Phase L4 — Public UI validation (Claude-driven)

### Structural (reliable, DOM-inspected)

| ID | Action | Expected | Actual | Result |
|---|---|---|---|---|
| U1 | Public page form fields | name/phone/count, **no code**, count 1–6 | matches | ✅ |
| U2 | Private page form fields | name/phone/**code**/count, count 1–4 | "Invite Code*" shown, 1–4 | ✅ |
| U3 | Both root (no param) | public form, **no code** | no code field | ✅ |
| U4 | Both `?private=true` | code field appears | "Invite Code*" shown | ✅ |
| U5 | Empty submit | inline required errors | name + phone errors render | ✅ |
| U6 | UI submit RPC + args | calls `submit_rsvp` w/ {name,phone,guest_count,message}+code | identical to RPC tests | ✅ |

Interactive *valued* submit (success screen / server-error render) is **not automatable** in the preview
harness (tanstack-form state doesn't accept programmatic input events; form also mounts via scroll
animation). Verified by **source trace** instead — which surfaced the bug below.

### 🐞 BUG-1 (HIGH) — failed submit fires confetti, shows no error

- `useMutation.mutate` with `silent:true` swallows the rejection (`.catch`), so `mutate()` resolves on failure.
- `useRsvpSection.handleSubmit` then unconditionally `setSubmitted(true)` + `confetti()` + scroll.
- Hook never exposes `submit.error`; template shows success only off `existingRSVP` (set on real success).
- **Result:** on wrong code / capacity / duplicate / not-on-list / deadline → confetti + no error message;
  guest gets no failure feedback. Worst for private/both. Server throws are all correct; UI eats them.
- Files: `src/lib/query/useMutation.ts:83`, `src/pages/wedding/templates/engine/useRsvpSection.ts:47`,
  `src/pages/wedding/templates/unique-muslim/index.tsx:548`.

### NIT-1 — stale comment

`src/pages/wedding/queries.ts:88` references `submit_rsvp_v2`; code calls canonical `submit_rsvp` (consolidated at go-live). Comment-only.

## Phase 4 — Cross-cutting / integrity (L1)

| ID | Action | Expected | Actual | Result |
|---|---|---|---|---|
| 4.1 | Multi-page create, phone dup on 1 page | throw + 0 rows anywhere | "…already exists on a selected page", recRows=0 | ✅ |
| 4.2 | Multi-page create, count>max on 1 page | throw + 0 rows | "…cannot exceed 4 on every selected page", recRows=0 | ✅ |
| 4.3 | Copy guest to 2 pages | 2 rows, distinct invitation_id | rows=2, invs=2 | ✅ |
| 4.4 | Move to page where phone exists | blocked, stays on origin | "…already exists", onReception=true | ✅ |
| 4.5 | Move to page with tighter bounds (6→max4) | blocked, stays on origin | "…cannot exceed 4", onReception=true | ✅ |
| 4.6 | Valid move | invitation_id → target | moved=true | ✅ |
| 4.7 | `invite_code` column | dropped | "column …invite_code does not exist" | ✅ |

**OBS-1:** `create_guest_on_pages` / `update_guest` do **not** enforce `max_guests` total capacity (admin can
overfill beyond cap — pre-loaded reserved seats count toward capacity but admin create isn't capped).
Likely intended (admin override) — confirm.
**NIT-2:** 4.2 message "cannot exceed 4 **on every selected page**" is misleading when only one page fails.

## Single RSVP enum — `source` retired, `both` fully dropped (migration 0009)

Consolidated to ONE enum: `event_rsvp_mode = ('public','private')`. Dropped `event_rsvp_source` + the
`event_rsvps.source` column (redundant — a private page's rows are the reserved list, matched by phone).
`event_rsvp_mode` recreated without `'both'` (rename→new→retype column→recreate update_invitation). Migration
`20260618000009` (atomic `BEGIN…COMMIT`) **run + verified 9/9**: source column gone, enum rejects `both`,
create/move/RSVP work on both modes, reserved-needs-phone enforced. FE + schema.sql synced.

## `both` RSVP mode — REMOVED (post-testing decision)

`both` (open RSVP + reserved seats on one page) was dropped — it was the only reason for the per-guest
type toggle, the `?private` link variant, and the branching submit path. Model is now **public | private**;
a page's mode fully derives its guests' `source` (server-side). Migration `20260618000008` (`submit_rsvp`,
`update_invitation`, `create_guest_on_pages`, `update_guest` — both-logic cut) **run + verified 8/8**.
FE swept (14 files), schema.sql synced. Enum keeps `'both'` (Postgres) unused; `source` column kept (derived).

---

## Phase 5 — RPC error-assertion sweep (L1/L2)

| ID | RPC | Action | Expected message | Result |
|---|---|---|---|---|
| S1 | submit_rsvp | unknown invitation | Invitation not found | ✅ |
| S2 | submit_rsvp | missing name | Name is required | ✅ |
| S3 | submit_rsvp | missing phone | Phone number is required | ✅ |
| S4 | submit_rsvp | missing count | Guest count is required | ✅ |
| D1 | submit_rsvp | past deadline | RSVP deadline has passed | ✅ |
| M1 | submit_rsvp | message required, omitted | Message is required | ✅ |
| M2 | submit_rsvp | message provided | success | ✅ |
| I1 | update_invitation | unknown id | Invitation not found | ✅ |
| I2 | update_invitation | max<min | Maximum guests cannot be less than the minimum | ✅ |
| I3 | update_invitation | private, no code | A private code is required for private or both RSVP mode | ✅ |
| C1 | create_guest_on_pages | empty pages | Select at least one invitation page | ✅ |
| C2 | create_guest_on_pages | no name | Guest must have a name | ✅ |
| G1 | update_guest | unknown id | Guest not found | ✅ |
| G2 | update_guest | wrong event | Guest does not belong to this event | ✅ |
| T1/T2 | get/cancel_rsvp | non-uuid token | uuid type error | ✅ |
| T3 | get_rsvp | wrong uuid token | RSVP not found | ✅ |

(Mode-specific throws — invalid code, not-on-list, capacity, both-guidance, duplicate — covered in Phases 1–3.)

---

## Summary
- **RPC layers (L1/L2): 50/50 pass** — Phase 0 (4) + RSVP modes (21) + cross-cutting (7) + error sweep (18).
- **Public UI (L4): structural 6/6 pass; 1 high-sev bug (BUG-1).**
- **Admin UI (L3):** guests page renders (filter scope labels All/Grand Reception/Nikah/Reception);
  create modal opens with correct defaults (single page pre-checked, source-by-mode, bounds = page
  intersection, status Pending); copy-to-pages confirmed (same guest on 2 pages). Interactive submit
  not automatable (Radix Select + form-state); create RPC fully covered at L1. DESIGN-1/2 confirmed real.

## Findings backlog (fix after testing)
- **BUG-1 (HIGH) — ✅ FIXED:** `handleSubmit` now gates confetti/success on the mutation's success
  callback; on failure it returns early and the server message renders inline above the actions
  (`submitError` → `RSVPForm error` prop → `formError` class). Files: `useRsvpSection.ts`,
  `form/RSVPForm.tsx`, `form/types.ts`, `unique-muslim/index.tsx`, `unique-muslim/form.ts`. Build clean.
  *Pending user re-verify in real browser (e.g. /nikah, right phone + wrong code → inline error, no confetti).*
- **DESIGN-1 — ✅ FE FIXED (final model: type derived from page):** Removed the always-on Guest type
  selector. The page's mode defines the guest's source (derived server-side); the selector now appears
  **only when a `both`-mode page is selected** (below the checklist, with a hint that it only governs the
  both-page). All pages freely selectable; no disabling. Verified in preview (both→shows, no-both→hidden).
  Files: `GuestForm.tsx`. **RPC change (derive source per page) pending — supersedes the 0007 guard.**
- **DESIGN-2 — ✅ FE FIXED:** `guestFormSchema` now requires phone when source=private ("Phone is
  required for reserved guests"); Public stays optional. `guests/types.ts`. Build clean. *(Eyeball: add a
  Reserved guest with no phone → blocked.)*
- **OBS-1:** admin guest create/move not capped by `max_guests` (likely intended override — confirm).
- **NIT-1 — ✅ FIXED:** corrected the stale `submit_rsvp_v2` comment in `queries.ts`.
- **NIT-2 — gated:** "cannot exceed N on every selected page" copy lives in `create_guest_on_pages` body.

### Polish fixes (FE, done + verified)
- **Add-to-pages rebuilt on `FieldShell`** (matches `AssigneeField` custom-field pattern): "Add to pages"
  is now a real field label that goes destructive + shakes on error, and the "Select at least one page"
  message renders consistently (was computed but never shown). Boxed selectable rows via Radix `sr-only`
  checkbox + `has-[[data-state=checked]]` styling.
- **Guest type animates in/out** by height when a both-page is (de)selected; `-16px` marginTop offsets
  FieldGroup's gap-4 so no phantom gap.
- **DESIGN-2 relocated** into `validateGuestForm` (phone required when the guest will be Reserved on a
  selected page) since the type is now page-derived, not a standalone field.

### Migration — ✅ RUN + VERIFIED
- **`20260618000007_guest_source_derive.sql`** — derives guest source per page from the page mode
  (supersedes the earlier guard idea; old file deleted, never run) + reserved-needs-phone backstop.
  **Verified 8/8** via RPC: private→private, public→public, both honors toggle, move re-derives both ways,
  multi-page mixed gives per-page sources, reserved-no-phone rejected.

### Resolved / closed
- **Name field redundancy** — decided: **leave edit as-is** (no name/phone hiding). Private-claim variant
  not pursued. Closed.

### Still open (optional)
- **NIT-2 copy** — "cannot exceed N on every selected page" wording, lives in `create_guest_on_pages` body
  (gated). Fold into a future migration only if wanted.
