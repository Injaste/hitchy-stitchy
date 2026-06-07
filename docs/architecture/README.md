# Architecture notes

The **why** behind this codebase's conventions, not just the what. `CLAUDE.md`
holds the always-on guardrails; these docs hold the deeper reasoning you read
when working in a given area.

Keep them **terse** — scannable rules and tables, not essays. A doc you have to
scroll to answer a simple question is a tax on every task.

- [conventions.md](conventions.md) — coding standards: naming and comment style.
- [forms.md](forms.md) — form primitives (bundles vs shells), when to use which, and how to surface form errors (inline vs toast).
- [auth.md](auth.md) — auth folder structure, the `AuthGate` → `/login` pattern, the login/session/redirect flow, and logout destinations.
- [mutations.md](mutations.md) — the `useMutation` wrapper (silent/toast/promise), and where mutation side effects live (data → hook, UI/routing → call site).
- [bundling.md](bundling.md) — the `manualChunks` strategy, the Rolldown vendor-split caveat, and lazy-route chunking.
