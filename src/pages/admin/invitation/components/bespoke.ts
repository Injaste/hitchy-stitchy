// Shared copy + accent for the bespoke entry points — the hub tile
// (BespokeInvitationCard) and the browse-sheet strip (BespokeTemplatePrompt) — so
// the two surfaces can't drift apart. Both open the same BespokeRequestModal.

/** Bespoke is hidden on the FE until the iterative-service flow (couple ↔ designer
 *  communication + bounded revision rounds) is designed — see execution-plan-E.md.
 *  Flip to true to re-render the hub card, browse-sheet card, and request modal.
 *  Typed boolean (not literal) so the gate reads as a real flag, not dead code. */
export const BESPOKE_ENABLED: boolean = false;

export const BESPOKE_TITLE = "Want something custom?";
export const BESPOKE_BLURB =
  "A one-of-a-kind invitation, designed from scratch.";

/** Display price for the bespoke service. NOT in the `plans` catalog (resolved
 *  server-side from service_key once the backend lands) — this is the display-only
 *  seam the backend will later own. */
export const BESPOKE_PRICE = 250;

/** Premium add-on accent: gradient + dashed primary colour, marking it apart from
 *  the real invitation pages / template options it sits beside. No `border` width
 *  here — on a `Card` the dashed stays inert (ring + gradient, like a draft
 *  InvitationCard); a plain element adds its own `border` to render the dash. */
export const bespokeSurface =
  "border-dashed border-primary/30 bg-gradient-surface";
