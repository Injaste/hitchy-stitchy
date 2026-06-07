# Conventions

Coding standards for this codebase. (The behavioral guardrails and the
project-rules index live in `CLAUDE.md`; this is the detail.)

## Naming

This is a wedding platform, not generic SaaS — names must match the domain's
theme and semantics, not boilerplate product vocabulary. When a neutral term and
a domain-fitting one both work, choose the one that speaks to a wedding context
(e.g. the sign-in route is `/login`; prefer guest / couple / RSVP / invitation
framing over generic `user` / `account` / `entity`). Applies across routes,
files, components, variables, and user-facing copy.

## Comments — explain *why*, not *what*

The code already says what it does; a comment must add what the code can't. Don't
narrate mechanics (`// loop over items`, `// add 1 to the index`). Do capture
intent and the non-obvious: why a guard/edge case exists, what real-world
scenario triggers it, why a value was chosen, or a tradeoff taken.

When a comment *is* warranted, write it **fully** — enough that a reader who has
never seen this situation can reconstruct the reasoning on their own. Don't leave
cryptic shorthand (`// edge case`, `// for safety`, `// hack`); spell out the
chain: **the trigger → the cause → the consequence → why this handling.**
Verbose-but-clear beats terse-but-opaque; a few extra lines that save the next
person a debugging session are worth it. (This isn't license to comment
everything — see the litmus test below. It's about quality *when* you do comment.)

Litmus test: if deleting the comment loses no understanding, delete it. Example —
for an out-of-range fallback, don't write "if dayNum is 0, show a date"; explain
that `dayNum` is 0 only when the item's day falls outside the current event
range, which happens if the event dates were shortened *after* the item was
scheduled (leaving an orphan day), and that we keep it visible with a date label
so the data isn't silently lost.
