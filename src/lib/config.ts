// Canonical public origin for shareable links (wedding URLs, member invite
// links). Required: validated at build time in vite.config.ts, so it's always
// present here — no runtime fallback. NOTE: auth redirects deliberately use
// window.location.origin instead, since they must reflect the actual host.
export const BASE_URL = import.meta.env.VITE_BASE_URL as string;
