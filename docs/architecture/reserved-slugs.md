# Reserved slugs

User event URLs live at the **root**: `/:slug` (and `/:slug/:link_slug`). That means
every user slug competes with the app's own paths. If a user grabs `pricing` or
`vendors` before we ship that route, reclaiming it once their event is live is
effectively impossible — so we **pre-reserve** system / route / brand / product /
plan-tier slugs up front.

## Mechanism (no logic — pure data)

Reservations are **permanent rows** in `slug_reservations` (`expires_at IS NULL`),
owned by the system sentinel `00000000-0000-0000-0000-000000000000`. The existing
checks already honour them — nothing else to wire:

| Consumer | What it gates |
| --- | --- |
| `is_slug_taken` / `reserve_slug` | event slug `/:slug` |
| `create_invitation` | invitation page `link_slug` `/:slug/:link_slug` |

A permanent row blocks **everyone** (the `expires_at IS NULL` branch in both checks
ignores the owner comparison), and is never purged by the expiry cron.

Seed: [`20260629000001_reserve_system_slugs.sql`](../../supabase/migrations/2026/06/29/20260629000001_reserve_system_slugs.sql).

## THE RULE

> **Adding a top-level route, or a public/marketing surface you'll route to later?
> Reserve its path here in the same change.**

This applies to: anything mounted under `/` in [`AppRoutes`](../../src/app/AppRoutes.tsx)
(`standaloneRoutes`), plus *planned* surfaces (pricing, careers, blog, vendors,
registry…) and any new **plan-tier name**. Reserve the obvious variants too:
singular/plural, hyphenated/joined (`gift-card` **and** `giftcard`), and common
synonyms.

## How to add more (append-only)

The seed migration is **immutable once run** — never edit it to add words. Add a
**new** migration that inserts the new slugs with the same sentinel + idempotent
upsert:

```sql
-- supabase/migrations/<date>/<ts>_reserve_<feature>_slugs.sql
INSERT INTO public.slug_reservations (slug, user_id, expires_at)
SELECT DISTINCT s, '00000000-0000-0000-0000-000000000000'::uuid, NULL::timestamptz
FROM unnest(ARRAY[
  'newroute','new-route'           -- the path(s) the feature adds
]::text[]) AS s
WHERE s ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'   -- skip anything not a valid slug
ON CONFLICT (slug) DO UPDATE
  SET user_id = excluded.user_id, expires_at = NULL;
```

`DISTINCT` (no "ON CONFLICT affects row twice") + the regex filter (no dead
sub-3-char rows) + `ON CONFLICT DO UPDATE` (idempotent, forces permanence) are
load-bearing — keep all three.

> Substring/leet profanity matching is a **separate** mechanism (a filter inside
> `reserve_slug`), not this exact-match table. Don't add profanity *patterns* here.
