import type { EventInvitation, EventDaySegment } from "./types"
import type { EventDay } from "../days/types"
import { dayLabel } from "../days/utils"
import type { ThemeConfig, ThemeFieldGroup } from "@/pages/wedding/templates/types"
import type { PublicEventConfig } from "@/pages/wedding/types"

// Display label for an invitation page: its segment name, else the day's label
// (with the positional "Day N" fallback). `days` must be the date-sorted list.
export function pageLabel(
  inv: Pick<EventInvitation, "day_id" | "segment_id">,
  days: EventDay[],
  segments: EventDaySegment[],
): string {
  if (inv.segment_id) {
    const seg = segments.find((s) => s.id === inv.segment_id)
    if (seg?.name?.trim()) return seg.name.trim()
  }
  const idx = days.findIndex((d) => d.id === inv.day_id)
  return dayLabel(days[idx]?.label, idx)
}

// Combine a local date + time into the "YYYY-MM-DD HH:MM" UTC string the RSVP
// deadline column expects. Null date -> null (no deadline).
const pad = (n: number) => String(n).padStart(2, "0");
export function combineDeadline(
  date: string | null,
  time: string | null,
): string | null {
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = (time ?? "23:59").split(":").map(Number);
  if ([y, m, d, h, min].some(Number.isNaN)) return null;
  const local = new Date(y, m - 1, d, h, min);
  return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())} ${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`;
}

// ── New parallel model (event_invitations) ───────────────────────────────────
// One EventInvitation row carries both design + RSVP config. `draft` overrides
// the saved design for the live editor preview.
export function composeInvitationConfig(
  inv: EventInvitation,
  draft?: ThemeConfig | null,
): PublicEventConfig {
  // The countdown date/time live in the design config (content). Project them onto
  // the top-level PublicEventConfig the template reads (eventConfig.event_date).
  const fc = (draft ?? inv.draft_config ?? {}) as Record<string, unknown>;
  return {
    id: inv.id,
    event_id: inv.event_id,
    event_date: (fc.event_date as string | null) ?? null,
    event_time_start: (fc.event_time_start as string | null) ?? null,
    event_time_end: null,
    rsvp_mode: inv.rsvp_mode,
    rsvp_deadline: inv.rsvp_deadline,
    max_guests: inv.max_guests,
    guest_count_min: inv.guest_count_min,
    guest_count_max: inv.guest_count_max,
    confirmation_message: inv.confirmation_message,
    config: inv.rsvp_config,
    published_page: inv.template_key
      ? {
          id: inv.id,
          theme_slug: inv.template_key,
          config: draft ?? inv.draft_config ?? ({ slug: null } as ThemeConfig),
        }
      : null,
  }
}

// Preview a template before it's been used — no invitation row yet. Defaults for
// everything except the design (the template's registry default config).
export function composeTemplatePreviewConfig(
  templateKey: string,
  config: ThemeConfig,
): PublicEventConfig {
  const fc = (config ?? {}) as Record<string, unknown>;
  return {
    id: "preview",
    event_id: "preview",
    event_date: (fc.event_date as string | null) ?? null,
    event_time_start: (fc.event_time_start as string | null) ?? null,
    event_time_end: null,
    rsvp_mode: "public",
    rsvp_deadline: null,
    max_guests: null,
    guest_count_min: 1,
    guest_count_max: 10,
    confirmation_message: null,
    config: { rsvp: { fields: { message: { visible: false, required: false } } } },
    published_page: { id: "preview", theme_slug: templateKey, config },
  }
}

// ── Design-config mapping (used by the edit form) ────────────────────────────

// Flatten a template's schema into its design field keys.
export const designKeysOf = (groups: ThemeFieldGroup[]): string[] =>
  groups.flatMap((g) => g.fields.map((f) => f.key));

// Seed the form's design half from a saved config, falling back to each field's
// schema default (section-list → empty array) — so untouched fields persist.
export const buildDesignDefaults = (
  groups: ThemeFieldGroup[],
  config: ThemeConfig | null,
): Record<string, unknown> => {
  const fc = (config ?? {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const g of groups)
    for (const f of g.fields) {
      const raw = fc[f.key];
      out[f.key] =
        f.type === "section-list"
          ? Array.isArray(raw)
            ? raw
            : []
          : typeof raw === "string"
            ? raw
            : (f.default ?? "");
    }
  return out;
};

// Coerce design values for storage: strings trim→null, arrays as-is.
export const coerceDesign = (
  values: Record<string, unknown>,
  keys: string[],
): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    const v = values[k];
    out[k] = Array.isArray(v)
      ? v
      : typeof v === "string"
        ? v.trim() || null
        : (v ?? null);
  }
  return out;
};

// Key-order-independent deep equality for plain JSON config objects/arrays — used
// to tell whether the saved draft differs from the published snapshot.
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (typeof a !== "object") return false;
  const arrA = Array.isArray(a);
  if (arrA !== Array.isArray(b)) return false;
  if (arrA) {
    const ba = b as unknown[];
    return (
      (a as unknown[]).length === ba.length &&
      (a as unknown[]).every((v, i) => deepEqual(v, ba[i]))
    );
  }
  const ak = Object.keys(a as object);
  const bk = Object.keys(b as object);
  if (ak.length !== bk.length) return false;
  return ak.every((k) =>
    deepEqual(
      (a as Record<string, unknown>)[k],
      (b as Record<string, unknown>)[k],
    ),
  );
}
