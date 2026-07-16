// Phone numbers — dial codes, E.164 storage, and WhatsApp deep links.
//
// Numbers are stored as E.164 (`+6591234567`): one column, unambiguous, and the
// only format wa.me / tel: reliably accept. The UI splits that back into a
// country + national number for editing (see components/custom/form PhoneField).
//
// Country data comes from libphonenumber-js (the dial codes) + Intl.DisplayNames
// (the names) — no hand-maintained table, no second dependency.

import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

export type { CountryCode };

export interface CountryOption {
  code: CountryCode;
  /** Localised country name, e.g. "Malaysia". */
  name: string;
  /** Dial code with the plus, e.g. "+60". */
  dial: string;
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/** Every country libphonenumber knows, name-sorted — the picker's option list. */
export const COUNTRIES: CountryOption[] = getCountries()
  .map((code) => ({
    code,
    name: regionNames.of(code) ?? code,
    dial: `+${getCountryCallingCode(code)}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const COUNTRY_BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

/** Dial digits → country. Several countries share a code (+1 US/CA, +7 RU/KZ);
 *  first wins, which is harmless — the dial code is what tel:/wa.me use, and
 *  that's identical across the sharers. */
const COUNTRY_BY_DIAL = new Map<string, CountryCode>();
for (const { code } of COUNTRIES) {
  const dial = getCountryCallingCode(code);
  if (!COUNTRY_BY_DIAL.has(dial)) COUNTRY_BY_DIAL.set(dial, code);
}

/** SG-first fallback when we can't infer anything. */
export const DEFAULT_COUNTRY: CountryCode = "SG";

/** The markets the product serves — enough to default the picker sensibly from
 *  the browser's timezone. Anything unlisted falls back to SG. Deliberately a
 *  short table rather than a tz→country dependency (there are ~400 zones; we
 *  need a dozen). */
const COUNTRY_BY_TIMEZONE: Record<string, CountryCode> = {
  "Asia/Singapore": "SG",
  "Asia/Kuala_Lumpur": "MY",
  "Asia/Kuching": "MY",
  "Asia/Jakarta": "ID",
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "Asia/Bangkok": "TH",
  "Asia/Manila": "PH",
  "Asia/Ho_Chi_Minh": "VN",
  "Asia/Saigon": "VN",
  "Asia/Hong_Kong": "HK",
  "Asia/Taipei": "TW",
  "Asia/Tokyo": "JP",
  "Asia/Seoul": "KR",
  "Asia/Brunei": "BN",
  "Asia/Dubai": "AE",
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Australia/Perth": "AU",
};

/** Best guess at the *user's* country (they're adding local vendors), from the
 *  browser timezone. No permission prompt, no network, no geolocation — this is
 *  only a default the picker shows and the user can change. */
export function countryFromTimeZone(): CountryCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return COUNTRY_BY_TIMEZONE[tz] ?? DEFAULT_COUNTRY;
  } catch {
    return DEFAULT_COUNTRY;
  }
}

/** The shortlist surfaced above the A–Z list, for a user whose home country is
 *  in it. Deliberately labelled "Nearby" in the UI — never a bloc name like
 *  "ASEAN"/"Southeast Asia", which would assert who belongs to what. It's a
 *  dial-shortlist for the markets this product serves, nothing more: entries
 *  are here because they're dialable and close, and every name still renders
 *  from the user's own CLDR data (see COUNTRIES). */
const NEARBY: CountryCode[] = [
  "SG",
  "MY",
  "ID",
  "BN",
  "TH",
  "PH",
  "VN",
  "KH",
  "LA",
  "MM",
  "HK",
  "TW",
  "CN",
  "JP",
  "KR",
  "IN",
  "LK",
  "BD",
  "AU",
  "NZ",
  "AE",
];

/** Home country first, then the rest of its region. A home country outside the
 *  shortlist gets just itself back — we don't assert a neighbourhood for users
 *  in markets we haven't thought about. */
export function nearbyCountries(home: CountryCode): CountryOption[] {
  const self = countryOption(home);
  if (!NEARBY.includes(home)) return [self];
  return [
    self,
    ...NEARBY.filter((code) => code !== home).map((code) => countryOption(code)),
  ];
}

export function countryOption(code: CountryCode): CountryOption {
  return (
    COUNTRY_BY_CODE.get(code) ?? {
      code,
      name: code,
      dial: `+${getCountryCallingCode(code)}`,
    }
  );
}

/** Splits stored E.164 back into picker + input state. Falls back to `fallback`
 *  for the country when the value is empty or has no recognisable dial code. */
export function splitPhone(
  value: string | null | undefined,
  fallback: CountryCode,
): { country: CountryCode; national: string } {
  const absorbed = absorbDialCode(value ?? "");
  if (absorbed) return absorbed;
  return { country: fallback, national: (value ?? "").replace(/\D/g, "") };
}

/** Pulls a leading +<dial code> out of typed/pasted text — the "paste a number
 *  from WhatsApp and it just works" path. Returns null when there's no plus or
 *  the digits don't start with a known code (e.g. mid-typing "+6"). Calling
 *  codes are prefix-free, so the longest match is the only match. */
export function absorbDialCode(
  input: string,
): { country: CountryCode; national: string } | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("+")) return null;

  const digits = trimmed.slice(1).replace(/\D/g, "");
  for (let len = Math.min(3, digits.length); len >= 1; len--) {
    const country = COUNTRY_BY_DIAL.get(digits.slice(0, len));
    if (country) return { country, national: digits.slice(len) };
  }
  return null;
}

/** Picker + input → the E.164 we store. Null when there's no national number,
 *  so an untouched optional field saves as NULL rather than a bare dial code. */
export function toE164(country: CountryCode, national: string): string | null {
  const digits = national.replace(/\D/g, "");
  if (!digits) return null;
  return `+${getCountryCallingCode(country)}${digits}`;
}

/** Display form — "+65 9123 4567". Uses libphonenumber's own grouping when the
 *  number parses; falls back to "<dial> <national>" for a partial/unknown one so
 *  a half-entered number still renders instead of vanishing. */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return "";

  const parsed = parsePhoneNumberFromString(value);
  if (parsed) return parsed.formatInternational();

  const parts = absorbDialCode(value);
  return parts
    ? `${countryOption(parts.country).dial} ${parts.national}`
    : value;
}

// ── WhatsApp ─────────────────────────────────────────────────────────────────

/** The two wa.me shapes: `share` opens the picker with a prefilled message (no
 *  recipient); `chat` opens a thread with one number. `chat` needs a full
 *  international number — which is exactly why phones are stored as E.164. */
export type WhatsAppTarget =
  | { type: "share"; text: string }
  | { type: "chat"; phone: string | null | undefined };

/** Builds a wa.me URL. A `share` always resolves; a `chat` is null when there's
 *  no usable number, so the caller hides the button rather than shipping a link
 *  WhatsApp will reject. */
export function whatsAppHref(target: { type: "share"; text: string }): string;
export function whatsAppHref(target: {
  type: "chat";
  phone: string | null | undefined;
}): string | null;
export function whatsAppHref(target: WhatsAppTarget): string | null {
  if (target.type === "share") {
    return `https://wa.me/?text=${encodeURIComponent(target.text)}`;
  }
  const digits = (target.phone ?? "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}
