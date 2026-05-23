export interface ParsedGoogleFont {
  url: string;
  family: string;
  generic: string;
}

const GOOGLE_FONT_HOST = "fonts.googleapis.com";

// Maps lowercase font family name → CSS generic family.
// Handwriting/calligraphy → cursive; display/text serifs → serif;
// grotesques / humanists → sans-serif; monospaced → monospace.
// Unknown fonts default to "serif" — a safe bet for wedding typography.
const GENERIC_MAP: Record<string, string> = {
  // cursive — handwriting / calligraphy
  "italianno": "cursive",
  "great vibes": "cursive",
  "parisienne": "cursive",
  "sacramento": "cursive",
  "dancing script": "cursive",
  "pinyon script": "cursive",
  "alex brush": "cursive",
  "allura": "cursive",
  "tangerine": "cursive",
  "rouge script": "cursive",
  "mr de haviland": "cursive",
  "lovers quarrel": "cursive",
  "style script": "cursive",
  "ephesis": "cursive",
  "island moments": "cursive",
  "ms madi": "cursive",

  // serif — classic / display serifs
  "cinzel": "serif",
  "playfair display": "serif",
  "cormorant": "serif",
  "cormorant garamond": "serif",
  "cormorant infant": "serif",
  "cormorant sc": "serif",
  "eb garamond": "serif",
  "lora": "serif",
  "merriweather": "serif",
  "libre baskerville": "serif",
  "crimson text": "serif",
  "noto serif": "serif",
  "pt serif": "serif",
  "source serif 4": "serif",
  "dm serif display": "serif",
  "dm serif text": "serif",
  "gfs didot": "serif",
  "jost": "serif",
  "forum": "serif",
  "bellefair": "serif",
  "sorts mill goudy": "serif",
  "unna": "serif",

  // sans-serif
  "noto sans": "sans-serif",
  "inter": "sans-serif",
  "raleway": "sans-serif",
  "montserrat": "sans-serif",
  "josefin sans": "sans-serif",
  "nunito": "sans-serif",
  "nunito sans": "sans-serif",
  "dm sans": "sans-serif",
  "lato": "sans-serif",
  "open sans": "sans-serif",
  "poppins": "sans-serif",
  "outfit": "sans-serif",
  "plus jakarta sans": "sans-serif",
  "urbanist": "sans-serif",

  // monospace
  "roboto mono": "monospace",
  "jetbrains mono": "monospace",
  "source code pro": "monospace",
  "ibm plex mono": "monospace",
  "space mono": "monospace",
  "dm mono": "monospace",
};

const DEFAULT_GENERIC = "serif";

export const parseGoogleFontUrl = (input: string | null | undefined): ParsedGoogleFont | null => {
  if (!input) return null;

  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    return null;
  }

  if (parsed.host !== GOOGLE_FONT_HOST) return null;
  if (!parsed.pathname.startsWith("/css")) return null;

  const family = parsed.searchParams.get("family");
  if (!family) return null;

  const bare = family.split(":")[0].replace(/\+/g, " ").trim();
  if (!bare) return null;

  const generic = GENERIC_MAP[bare.toLowerCase()] ?? DEFAULT_GENERIC;

  return { url: parsed.toString(), family: bare, generic };
};

export const isValidGoogleFontUrl = (input: string | null | undefined): boolean =>
  parseGoogleFontUrl(input) !== null;

export const cssFontFamily = (family: string, generic: string): string =>
  `'${family}', ${generic}`;
