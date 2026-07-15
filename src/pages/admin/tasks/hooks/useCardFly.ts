import { create } from "zustand";

import type { FlyRect, FlyRing } from "../types";

/**
 * Drives the "fly" overlay for the two non-drag card moves we animate:
 * the error snap-back and a form/checkbox status change. A drag isn't animated
 * (you're already moving it), and create/delete/archive have no spatial story.
 *
 * FLIP via a portal clone: `takeOff` snapshots the card's rect + HTML and hides
 * the real card; `land` flags the flight to fly, and the overlay's clone chases
 * the card's live rect each frame until it lands. A clone in a fixed portal
 * isn't clipped by the lanes' overflow, so it can cross columns freely.
 *
 * Flights are keyed by task id, so several cards can fly at once (e.g. rapid
 * checkbox toggles) — each renders an independent clone that owns its own chase
 * loop. The store is just the registry; the motion lives in CardFlyOverlay.
 */

export interface Flight {
  id: string;
  html: string;
  from: FlyRect;
  landed: boolean; // false = lifted in place (below a modal); true = fly to slot
  key: number; // React key — a fresh flight per takeOff resets the clone
  ring: FlyRing | null; // success (into Done), destructive (snap-back), or none
  radius: string; // the card's border-radius so the ring hugs its corners
}

interface CardFlyState {
  flights: Record<string, Flight>;
  takeOff: (id: string, ring?: FlyRing) => void;
  land: (id: string) => void;
  clear: (id: string) => void;
}

export const cardEl = (id: string) =>
  document.querySelector<HTMLElement>(`[data-task-id="${CSS.escape(id)}"]`);

export const rectOf = (el: HTMLElement): FlyRect => {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
};

let key = 0;

export const useCardFly = create<CardFlyState>((set) => ({
  flights: {},

  takeOff: (id, ring) => {
    const el = cardEl(id);
    if (!el) return;
    const flight: Flight = {
      id,
      // strip the id so the clone can't be confused for the real card
      html: el.outerHTML.replace(/\sdata-task-id="[^"]*"/, ""),
      from: rectOf(el),
      landed: false,
      key: ++key,
      ring: ring ?? null,
      radius: getComputedStyle(el).borderRadius,
    };
    set((s) => ({ flights: { ...s.flights, [id]: flight } }));
  },

  land: (id) =>
    set((s) =>
      s.flights[id]
        ? { flights: { ...s.flights, [id]: { ...s.flights[id], landed: true } } }
        : s,
    ),

  clear: (id) =>
    set((s) => {
      if (!s.flights[id]) return s;
      const next = { ...s.flights };
      delete next[id];
      return { flights: next };
    }),
}));
