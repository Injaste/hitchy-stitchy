// Shared styling tokens for form controls. Kept inside ui/ so the primitives
// (input, textarea, select, switch, radio, checkbox) compose them directly —
// single source of truth so the controls can't drift apart.

// Border surface shared by text-like controls (input, textarea, select trigger).
export const fieldSurface =
  "rounded-lg border border-input bg-transparent shadow-xs transition-[color,box-shadow] outline-none";

// Focus + invalid ring shared by ALL controls, including switch/radio/checkbox.
export const fieldRing =
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/70 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/70";

// Same ring semantics for wrapper <div> containers (InputGroup) where the ring
// must fire via has-[] because the focusable child is a descendant, not the root.
export const fieldRingGroup =
  "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/70 has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-destructive/70";
