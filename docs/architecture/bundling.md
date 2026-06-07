# Bundling / chunks

`manualChunks` in `vite.config.ts`, two layers.

**Layer 1 — vendors:** `vendor-motion` / `supabase` / `tanstack` / `ui` / `react`,
with `vendor-libs` as the catch-all.

> ⚠️ Inert under Vite 8 / Rolldown — only `vendor-libs` emits; the big libs
> collapse into `page-admin` (~2.1 MB) + `shared`. Fix = migrate to
> `output.advancedChunks` (see `LAUNCH-TODO.md`). Rules kept (with a NOTE) to
> document intent.

**Layer 2 — src by route** (these work):

```
home → page-home          auth/{sign-in,sign-up,reset} → page-auth
dashboard → page-dashboard admin → page-admin           rest → shared
```

- Rules must track folder moves — a moved page silently falls into `shared`.
- `shared` loads on every route — keep page-only code out of it.
- Lazy route = tiny stub; real code lands in its `manualChunks` chunk (group via config, not barrels).

**Tradeoff:** `/login` lives in `page-auth`; home no longer imports the auth
bundle (waitlist moved to `home/`), so `/login` fetches ~3 KB gzip on click
rather than preloaded. Accepted.
