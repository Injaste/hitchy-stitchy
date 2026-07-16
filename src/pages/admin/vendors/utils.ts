import {
  Camera,
  Video,
  Building2,
  Utensils,
  Crown,
  Sparkles,
  Mic,
  Music,
  Flower2,
  Car,
  Store,
  type LucideIcon,
} from "lucide-react";

import type { Vendor } from "./types";

// The SG vendor vocabulary — banquet + bridal studio + MUA + emcee + live band
// are the load-bearing ones here. `value` is what gets stored; the label/icon
// are display only. `others` is the catch-all + the fallback for any stored
// value not in this list (so switching to free-text later keeps rendering).
export interface CategoryMeta {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const CATEGORIES: CategoryMeta[] = [
  { value: "photographer", label: "Photographer", icon: Camera },
  { value: "videographer", label: "Videographer", icon: Video },
  { value: "venue", label: "Venue / Banquet", icon: Building2 },
  { value: "catering", label: "Catering", icon: Utensils },
  { value: "bridal", label: "Bridal Studio", icon: Crown },
  { value: "makeup", label: "Makeup & Hair", icon: Sparkles },
  { value: "emcee", label: "Emcee", icon: Mic },
  { value: "music", label: "Live Band / Music", icon: Music },
  { value: "florist", label: "Florist", icon: Flower2 },
  { value: "transport", label: "Transport", icon: Car },
  { value: "others", label: "Others", icon: Store },
];

const CATEGORY_BY_VALUE = new Map(CATEGORIES.map((c) => [c.value, c]));

const OTHERS: CategoryMeta = CATEGORIES[CATEGORIES.length - 1];

/** Meta for a stored category value, falling back to "Others" for anything
 *  unrecognised (keeps unknown/free-text values rendering with an icon). */
export function categoryMeta(value: string): CategoryMeta {
  return CATEGORY_BY_VALUE.get(value) ?? { ...OTHERS, label: value || OTHERS.label };
}

/** Newest first — matches the fetch order and the "just added" feel. */
export function sortVendors(list: Vendor[]): Vendor[] {
  return [...list].sort((a, b) => {
    if (a.created_at !== b.created_at)
      return a.created_at < b.created_at ? 1 : -1;
    return a.id < b.id ? 1 : -1;
  });
}
