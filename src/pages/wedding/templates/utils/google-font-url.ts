export interface ParsedGoogleFont {
  url: string;
  family: string;
}

const GOOGLE_FONT_HOST = "fonts.googleapis.com";

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

  return { url: parsed.toString(), family: bare };
};

export const isValidGoogleFontUrl = (input: string | null | undefined): boolean =>
  parseGoogleFontUrl(input) !== null;

export const cssFontFamily = (family: string): string => `'${family}'`;
