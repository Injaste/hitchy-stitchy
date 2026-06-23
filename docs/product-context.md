# Product Context — Hitchy Stitchy

> The "what / who / why" of the platform. Read this before writing user-facing
> copy, sample data, or marketing — it defines the positioning everything else
> should reflect. For *how the code is built*, see [`docs/architecture/`](architecture/README.md).

## What it is

Hitchy Stitchy is a **celebration invitation + planning suite**: a beautiful,
culturally-themed digital invitation paired with the tools to actually run the
event behind it — RSVP & guest list, a minute-by-minute timeline you can run
live on the day, tasks, budget, a gift-envelope ledger, your team of helpers,
and per-feature access control. Multi-day aware throughout.

## Who it's for

**Singapore / Southeast Asia first.** The platform is built to serve the
region's communities equally — **Chinese, Malay and Indian** — and people of
**any faith** (Buddhist, Muslim, Hindu, Sikh, Christian, Catholic, free-thinker,
interfaith). No single culture is the "default"; copy, sample data, and the
invitation template library should reflect a genuine balance, and mixed-culture
celebrations (very common in SG) are first-class, not edge cases.

Language stays **English** — we don't localise into other languages. We *do*
honour each culture's customs and vocabulary in English (e.g. an Indian wedding's
*mehndi* and *baraat*, a Malay *akad nikah* and *bersanding*, a Chinese tea
ceremony and *yum seng*).

## What it's for (event types)

Weddings are the heart of the product, but it is deliberately broader. Align copy
and examples to this spread:

- **Weddings** — the flagship, often multi-day (solemnisation/ROM + ceremony + banquet/reception).
- **Engagements** — proposals, engagement parties, betrothal customs.
- **Solemnisations** — ROM / akad nikah / civil ceremonies on their own.
- **Smaller celebrations & festive gatherings** — milestone parties, religious/festive
  invitations, and similar invite-and-host occasions.

Rule of thumb: lead with weddings, but never word things so narrowly that an
engagement or a festive celebration wouldn't see itself in the page.

## Product surface (what actually exists)

- **Invitations** — themed templates per culture/aesthetic; the public page guests land on.
- **RSVP & Guest list** — custom RSVP form on the invitation; responses flow in live.
- **Timeline** — per-day, segmented run-of-show; cues can be started/ended **live on the day** in real time.
- **Tasks** — kanban board (To do / In progress / Done) with priorities and assignees.
- **Budget** — expenses + vendors, partial/paid tracking, per-day caps and totals.
- **Gift Envelopes** — a money-gift ledger (ang bao / sampul duit / shagun), per day.
- **Members** — the wedding/event party and vendors, each with a role; the couple are superadmins.
- **Access** — per-feature View/Full grants per group; money stays private by default.
- **Multi-day** — days and segments are real; everything (timeline, budget, gifts) files under a day.

## Cultural vocabulary (English, customs honoured)

Use authentically; spread across examples so no one community dominates.

- **Chinese** — tea ceremony (敬茶), ang bao (red packet), *yum seng*, banquet, *jie mei* / *heng dai* (bridesmaids/groomsmen), lion dance, gatecrash/door games.
- **Malay / Muslim** — *akad nikah* (solemnisation), *bersanding* (sitting in state on the *pelamin* dais), *kompang*, *sampul duit* (money gift), *malam berinai* (henna night), *nasi minyak*, *hantaran* (gift exchange).
- **Indian** — *mehndi* (henna), *sangeet*, *baraat* (groom's procession), *mandap*, *pheras* / *saptapadi* (vows around the fire), *shagun* (money gift), garland exchange (*jaimala*).

Money gifts are a shared thread across all three (ang bao / sampul duit / shagun) —
which is exactly what the Gift Envelopes feature ledgers.

## Tone & honesty

- Warm, elegant, grounded — not SaaS-y or hype-driven.
- **Pre-launch:** the marketing site is honest about it (waitlist / "get early access").
  No fabricated metrics, testimonials, customer counts, or social proof. Showcase the
  real product with sample data, never invented numbers.

## Tech (one line)

React + TypeScript + Vite (Rolldown), Tailwind v4 (OKLCH tokens), framer-motion,
TanStack Query/Form, Zustand, Supabase. Conventions: [`docs/architecture/`](architecture/README.md).
