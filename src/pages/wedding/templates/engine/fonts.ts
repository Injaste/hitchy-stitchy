import { parseGoogleFontUrl, type ParsedGoogleFont } from "../utils/google-font-url"

// Curated set of wedding-appropriate Google Fonts. The couple picks a family in
// the editor (we store the family name); the engine resolves it to a css2 URL +
// generic at render time. Keep this list tasteful and small — quality over the
// full 1500-font Google catalogue.
export type FontCategory = "Script" | "Serif" | "Sans"

export interface CuratedFont {
  family: string
  category: FontCategory
  generic: string
  /** css2 stylesheet URL for rendering this family. */
  url: string
}

const css2 = (family: string, weights?: string) =>
  `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}` +
  (weights ? `:wght@${weights}` : "") +
  "&display=swap"

export const CURATED_FONTS: CuratedFont[] = [
  // ── Script — for couple names / flourishes ──
  { family: "Italianno", category: "Script", generic: "cursive", url: css2("Italianno") },
  { family: "Great Vibes", category: "Script", generic: "cursive", url: css2("Great Vibes") },
  { family: "Dancing Script", category: "Script", generic: "cursive", url: css2("Dancing Script", "400;500;600;700") },
  { family: "Parisienne", category: "Script", generic: "cursive", url: css2("Parisienne") },
  { family: "Sacramento", category: "Script", generic: "cursive", url: css2("Sacramento") },
  { family: "Pinyon Script", category: "Script", generic: "cursive", url: css2("Pinyon Script") },
  { family: "Allura", category: "Script", generic: "cursive", url: css2("Allura") },
  { family: "Alex Brush", category: "Script", generic: "cursive", url: css2("Alex Brush") },
  { family: "Tangerine", category: "Script", generic: "cursive", url: css2("Tangerine", "400;700") },
  { family: "Ephesis", category: "Script", generic: "cursive", url: css2("Ephesis") },

  // ── Serif — for headings / elegant body ──
  { family: "Cinzel", category: "Serif", generic: "serif", url: css2("Cinzel", "400;500;600;700") },
  { family: "Playfair Display", category: "Serif", generic: "serif", url: css2("Playfair Display", "400;500;600;700") },
  { family: "Cormorant Garamond", category: "Serif", generic: "serif", url: css2("Cormorant Garamond", "400;500;600;700") },
  { family: "EB Garamond", category: "Serif", generic: "serif", url: css2("EB Garamond", "400;500;600;700") },
  { family: "Lora", category: "Serif", generic: "serif", url: css2("Lora", "400;500;600;700") },
  { family: "Libre Baskerville", category: "Serif", generic: "serif", url: css2("Libre Baskerville", "400;700") },
  { family: "DM Serif Display", category: "Serif", generic: "serif", url: css2("DM Serif Display") },
  { family: "Cormorant", category: "Serif", generic: "serif", url: css2("Cormorant", "400;500;600;700") },
  { family: "Forum", category: "Serif", generic: "serif", url: css2("Forum") },
  { family: "Marcellus", category: "Serif", generic: "serif", url: css2("Marcellus") },
  { family: "Bodoni Moda", category: "Serif", generic: "serif", url: css2("Bodoni Moda", "400;500;600;700") },

  // ── Sans — for modern body / minimal headings ──
  { family: "Noto Sans", category: "Sans", generic: "sans-serif", url: css2("Noto Sans", "400;500;600;700") },
  { family: "Inter", category: "Sans", generic: "sans-serif", url: css2("Inter", "400;500;600;700") },
  { family: "Montserrat", category: "Sans", generic: "sans-serif", url: css2("Montserrat", "400;500;600;700") },
  { family: "Raleway", category: "Sans", generic: "sans-serif", url: css2("Raleway", "400;500;600;700") },
  { family: "Jost", category: "Sans", generic: "sans-serif", url: css2("Jost", "400;500;600;700") },
  { family: "Poppins", category: "Sans", generic: "sans-serif", url: css2("Poppins", "400;500;600;700") },
  { family: "Lato", category: "Sans", generic: "sans-serif", url: css2("Lato", "400;700") },
  { family: "Nunito Sans", category: "Sans", generic: "sans-serif", url: css2("Nunito Sans", "400;600;700") },
  { family: "DM Sans", category: "Sans", generic: "sans-serif", url: css2("DM Sans", "400;500;700") },
  { family: "Work Sans", category: "Sans", generic: "sans-serif", url: css2("Work Sans", "400;500;600;700") },
  { family: "Josefin Sans", category: "Sans", generic: "sans-serif", url: css2("Josefin Sans", "400;500;600;700") },
  { family: "Outfit", category: "Sans", generic: "sans-serif", url: css2("Outfit", "400;500;600;700") },
]

const BY_FAMILY = new Map(CURATED_FONTS.map((f) => [f.family, f]))

// Resolve a stored font value to a renderable font. Accepts a curated family
// name (the new format) or a raw Google-fonts URL (legacy / pasted), so old
// configs keep working.
export function resolveFont(value: string | null | undefined): ParsedGoogleFont | null {
  if (!value) return null
  const curated = BY_FAMILY.get(value)
  if (curated) return { url: curated.url, family: curated.family, generic: curated.generic }
  return parseGoogleFontUrl(value)
}

// One combined css2 request for every curated family at weight 400 — injected
// once in the editor so each picker option can preview in its own typeface
// without 30+ separate <link>s.
export function curatedPreviewStylesheetUrl(): string {
  const families = CURATED_FONTS.map((f) => `family=${f.family.replace(/ /g, "+")}`).join("&")
  return `https://fonts.googleapis.com/css2?${families}&display=swap`
}
