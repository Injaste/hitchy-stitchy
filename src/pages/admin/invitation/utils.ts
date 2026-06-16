import type { EventInvitation } from "./types"
import type { ThemeConfig } from "@/pages/wedding/templates/types"
import type { PublicEventConfig } from "@/pages/wedding/types"

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
