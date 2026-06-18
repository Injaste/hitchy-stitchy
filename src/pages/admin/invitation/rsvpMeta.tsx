import { Globe, Lock, GlobeLock, type LucideIcon } from "lucide-react";
import type { RSVPMode } from "./types";

// Single source of truth for how each RSVP mode is presented: its icon, short
// label, and the helper line shown under the picker. Shared by the invitation
// RSVP settings AND the guests surface (a guest's source — private/public — is a
// subset of these keys, so the same icons mark reserved vs public guests).
export interface RsvpModeMeta {
  label: string;
  hint: string;
  icon: LucideIcon;
}

export const RSVP_MODE_META: Record<RSVPMode, RsvpModeMeta> = {
  public: {
    label: "Public",
    hint: "Anyone with the link can RSVP.",
    icon: Globe,
  },
  private: {
    label: "Private",
    hint: "Only invited guests can RSVP — they enter their phone and the shared code below.",
    icon: Lock,
  },
  both: {
    label: "Both",
    hint: "Public guests RSVP freely; reserved guests open a ?private=true link to claim a held seat with the code. Tip: switch to Public or Private to preview each form.",
    icon: GlobeLock,
  },
};
