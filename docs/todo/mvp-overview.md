# MVP Roadmap — overview

The build menu to take Hitchy Stitchy from "good planning engine" to "a product
that rivals wedding-planning sites, SG-first." Each phase has its own file in
this folder (`mvp-phase-N-*.md`), sized to pick up cold. This file holds the
**thesis, sequencing, the shared recipe**, and the **open decisions** that span
phases. Read it first.

> Status: roadmap agreed at a high level; per-phase implementation plans are
> written when each phase starts. Nothing here is committed code yet.

## The wedge (working thesis)
**The operations + money command center for the SG wedding.** The invitation
page is the viral top-of-funnel (every guest sees it); the thing couples pay for
and stay for is *running the wedding* — timeline, team, **budget, ang bao,
seating**. SG "wedding sites" (SingaporeBrides, Blissful Brides) are content +
vendor directories; the real SaaS tools (Zola/Joy/Knot) are culturally US. The
money + banquet features below are things a US tool structurally can't match here.

## Sequence (recommended)
| Phase | Feature | Why here | Complexity |
|---|---|---|---|
| 1 | [Member invite link](mvp-phase-1-member-invite.md) | Correctness — invite loop is broken today. Unblocks team + viral loop. | low–med |
| 2 | [Budget tracker](mvp-phase-2-budget-tracker.md) | Biggest gap vs competitors; establishes the "money resource" pattern. | med |
| 3 | Gift Envelopes ledger — shipped | The SG wedge no US tool has. Reuses phase-2 pattern. | med |
| 4 | [Dietary / halal](mvp-phase-4-dietary-halal.md) | Small; multicultural necessity; prerequisite for good seating. | low |
| 5 | [Seating / table planner](mvp-phase-5-seating-planner.md) | Banquet round tables; heaviest build, wants guests+dietary solid first. | high |
| 6 | [Vendor management](mvp-phase-6-vendor-management.md) | Rebuild day-scoped; ties to budget + timeline. | med–high |
| 7 | [Invitation templates](mvp-phase-7-invitation-templates.md) | Engine done; authoring 3–5 designs so the invite side carries weight. | low (per design) |

**Monetization is deliberately last** and already documented — see
[`phase-1.md`](../payment-plans/phase-1.md). Don't build
billing inside these phases; just declare each feature's intended tier as you go.

## Cross-cutting SG glue (thread through every phase, cheap)
- **WhatsApp-first sharing** — invite link, RSVP link, save-the-date. SG runs on
  WhatsApp, not email. A `wa.me/?text=` share + copy-link button, nothing heavier.
- **SGD everywhere** money appears.
- **Halal / dietary** as a first-class guest concept (phase 4), not a config flag.
- **Multi-ceremony** is already native via `event_segments` — reuse it, don't rebuild.
- **PayNow** — phase-7/monetization only (Stripe Checkout + PayNow per the payments handoff); a PayNow QR on the invite is a possible later add.

---

## Recipe — adding a permission-gated CRUD feature
Phases 2, 3, 6 all follow this. Don't reinvent it per phase; the codebase has one
way to add a gated feature and it's worth matching exactly.

1. **Migration** `supabase/migrations/<timestamp>_<feature>.sql`:
   - `CREATE TABLE event_<x>` with `event_id uuid NOT NULL` FK → `events(id) ON DELETE CASCADE`. Denormalise `event_id` onto child rows (every existing child table does this for RLS).
   - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + a SELECT policy `USING (is_event_member(event_id))` (or a stricter `has_event_permission(...)` for sensitive data — see ang bao). **No INSERT/UPDATE/DELETE policies** — all mutations go through SECURITY DEFINER RPCs (matches every existing table).
   - Add the resource to the catalog: `INSERT INTO public.event_resources (resource) VALUES ('<x>')`.
   - Grant it in **both** seeded groups inside `create_event` — add `"<x>":"full"` to the Admin permissions jsonb and `"<x>":"read"` (or `"none"`) to Team — **and** backfill existing events' `event_access_groups.permissions` with an idempotent `UPDATE` (mirror section 7 of `20260605000001_collapse_access_three_level.sql`).
   - RPCs `create_<x>` / `update_<x>` / `delete_<x>`, all `SECURITY DEFINER`, each guarded: `IF NOT has_event_permission(p_event_id, '<x>', '<action>') THEN RAISE EXCEPTION '…'; END IF;`. `touch_updated_at` auto-attaches via the `auto_attach_triggers_on_create` event trigger — no manual trigger.
2. **Sync `supabase/schema.sql`** — add the table, policy, and RPC bodies to the reference snapshot (it is not auto-folded).
3. **Feature folder** `src/pages/admin/<x>/` mirroring `src/pages/admin/guests/`:
   `api.ts` (raw `supabase.rpc(...)` + `subscribeTo<X>` realtime channel), `queries.ts` (react-query hooks + realtime hook), `types.ts`, `components/`, `modals/`, `hooks/use<X>ModalStore.ts` (zustand), `states/` skeletons, `index.tsx`.
4. **Routing** — `<Route path="<x>" element={<RequireRead resource="<x>"><X /></RequireRead>} />` in `src/app/routes/AdminRoutes.tsx`.
5. **Sidebar** — a `NavItem` gated by `canRead("<x>")` in `src/pages/admin/sidebar/components/AdminSidebarContent.tsx`.
6. **Mutations** — go through `src/lib/query/useMutation.ts`; side-effect placement per [`mutations.md`](../architecture/mutations.md) (data/cache → query hook, UI/routing → call site).
7. **Query keys** — register in `src/pages/admin/lib/queryKeys.ts`.
8. **Tier** — note the intended Free/Pro/Advanced tier; wire real gating when the `plan-config` / `usePlan()` scaffold lands (payments handoff).
9. **Verify** — `npm run build` (Vite, not just tsc). No `console.log` / `// TODO` / commented-out code in commits.

## Permissions reference (current)
- Resources today: `timeline`, `tasks`, `guests`, `invitation`, `themes`, `members`, `access` (`event_resources` seed + `create_event`).
- Levels: `full` / `read` / `none` (`has_event_permission` → boolean per action; `access-config.ts` is just the icon/label map).
- Super-admins (`is_root` / `is_bride` / `is_groom`) bypass to `true` for everything — see `has_event_permission` in `schema.sql`.

## Open decisions (settle before/while building)
1. **Sequencing** — order above (invite → budget → ang bao → seating). Swap ang bao earlier if you want the differentiator as the headline.
2. **Budget + Ang bao packaging** — two separate sidebar items, or one **"Money"** section with two tabs? They share a mental model and could share one permission resource (`money`) or stay split (`budget`, `gifts`). Leaning: separate resources, grouped visually. Decide in phase 2.
3. **Wedding checklist** — *candidate, not scheduled.* Build as **seeded tasks** on the existing Tasks engine (`event_tasks` rows created at `create_event` with `due_at` derived from the wedding date, from an SG milestone template) rather than a new system. Cheap, high onboarding value. Promote to a phase if wanted.
4. **Wedge confirmation** — agree "operations + money command center," or lead with the invitation/RSVP product? Changes what "enough for MVP" means.

## Guardrails (from CLAUDE.md — apply to every phase)
- DB lives in Supabase; `schema.sql` + `migrations/` are the source of truth. Every backend change = a timestamped migration + schema.sql sync. Never call an RPC not confirmed in schema/migrations.
- `useAccess()` is the only client gate; server (RLS + RPCs) is the real boundary.
- Reuse the feature-folder pattern + existing primitives before writing new ones.
- Re-read a file before editing; search before creating a util/hook/component/RPC.
