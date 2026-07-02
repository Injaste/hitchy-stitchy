import { create } from "zustand";

interface TourSpotlightState {
  /** The admin sub-route the spotlight is armed for (e.g. "timeline"); null = off.
   *  Armed by clicking a route step in the guide; the overlay points at that page's
   *  primary action ([data-tour-action]) and disarms on click / leaving the page. */
  armedRoute: string | null;
  arm: (route: string) => void;
  disarm: () => void;
}

export const useTourSpotlight = create<TourSpotlightState>((set) => ({
  armedRoute: null,
  arm: (route) => set({ armedRoute: route }),
  disarm: () => set({ armedRoute: null }),
}));
