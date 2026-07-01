/**
 * The app's overlay stacking order, in one place. Higher = closer to the viewer.
 *
 * Most surfaces still use Tailwind's `z-30/40/50/60` classes directly; this table is
 * the authoritative reference for what each level MEANS, and the source of truth for
 * layers that need a value BETWEEN the Tailwind steps (the tour spotlight sits above
 * the topbar it dims, but below modals). Reference `Z.*` instead of a bare number
 * whenever a new overlay has to stack against these.
 *
 *   30  page headers / in-flow content peaks          (Tailwind z-30)
 *   40  AdminTopbar banners — live cue, limit reached  (Tailwind z-40)
 *   45  tour spotlight dim — above the topbar it dims
 *   46  setup-guide widget — above its own dim, below modals
 *   50  dialogs, sheets, popovers, tooltips            (Tailwind z-50)
 *   60  mobile drawer                                  (Tailwind z-60)
 */
export const Z = {
  header: 30,
  topbar: 40,
  tourOverlay: 45,
  tourWidget: 46,
  modal: 50,
  drawer: 60,
} as const;
