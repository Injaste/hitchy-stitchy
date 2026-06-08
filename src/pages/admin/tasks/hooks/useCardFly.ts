import { create } from "zustand";

import type { FlyRect, FlyRing } from "../types";

/**
 * Drives the "fly" overlay for the two non-drag card moves we animate:
 * the error snap-back and a form/checkbox status change. A drag isn't animated
 * (you're already moving it), and create/delete/archive have no spatial story.
 *
 * FLIP via a portal clone: `takeOff` snapshots the card's rect + HTML and hides
 * the real card; once the card has re-rendered at its new slot, `land` reads the
 * new rect and the overlay flies the clone from old → new. A clone in a fixed
 * portal isn't clipped by the lanes' overflow, so it can cross columns freely.
 */

interface Flight {
  id: string;
  html: string;
  from: FlyRect;
  to: FlyRect | null; // null while lifted, awaiting the landing slot
  key: number;
  ring: FlyRing | null; // success (into Done), destructive (snap-back), or none
  radius: string; // the card's border-radius so the ring hugs its corners
}

interface CardFlyState {
  flight: Flight | null;
  takeOff: (id: string, ring?: FlyRing) => void;
  land: (id: string) => void;
  clear: () => void;
}

const cardEl = (id: string) =>
  document.querySelector<HTMLElement>(`[data-task-id="${CSS.escape(id)}"]`);

const rectOf = (el: HTMLElement): FlyRect => {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
};

let key = 0;

export const useCardFly = create<CardFlyState>((set, get) => ({
  flight: null,

  takeOff: (id, ring) => {
    const el = cardEl(id);
    if (!el) return;
    set({
      flight: {
        id,
        // strip the id so the clone can't be confused for the real card
        html: el.outerHTML.replace(/\sdata-task-id="[^"]*"/, ""),
        from: rectOf(el),
        to: null,
        key: ++key,
        ring: ring ?? null,
        radius: getComputedStyle(el).borderRadius,
      },
    });
  },

  land: (id) => {
    // double rAF: wait for the cache patch to re-render the card at its new slot
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const f = get().flight;
        if (!f || f.id !== id) return;
        const el = cardEl(id);
        if (!el) return set({ flight: null });
        const to = rectOf(el);
        // no real move (e.g. status unchanged) → nothing to animate
        if (
          Math.abs(to.top - f.from.top) < 2 &&
          Math.abs(to.left - f.from.left) < 2
        ) {
          return set({ flight: null });
        }
        set({ flight: { ...f, to } });
      }),
    );
  },

  clear: () => set({ flight: null }),
}));
