# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## 5. Project-Specific Rules (Hitchy Stitchy)

**Context:** Re-read any file before editing it — don't trust memory or conversation history for current file state. Before creating a utility, hook, component, or RPC, search (Grep/Glob) to confirm one doesn't already exist.

**Backend:** The database is not in this repo. The source of truth is `supabase/schema.sql` + `supabase/migrations/`. Never call `supabase.rpc("name")` unless that function is confirmed in schema.sql or a migration. Every backend change gets a timestamped migration file — no undocumented schema changes.

**Access:** `useAccess()` is the sole client gate. Never read `isSuperAdmin` or `permissions` directly from `useAdminStore()` in UI components. Client gating is UX only — the server (RLS + RPCs) is the real boundary.

**Primitives:** Match the existing feature-folder pattern (`pages/admin/{domain}/api.ts`, `queries.ts`, `types.ts`, `components/`, `modals/`). Reuse `components/ui/`, `lib/query/useMutation.ts`, `lib/animations.ts`, and `pages/admin/lib/queryKeys.ts` before writing new ones.

**Verification:** Run `npm run build` (not just `tsc`) before marking any task done — Vite catches things tsc misses.

**Cleanliness:** No `console.log`, commented-out code, or `// TODO` left in committed files. Use `docs/LAUNCH-TODO.md` for deferred work.
