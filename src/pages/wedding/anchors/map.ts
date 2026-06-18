// Derive an embeddable Google Maps URL from a normal maps share/link URL.
// Shared by every template's anchor map drawer.
export function deriveMapEmbedUrl(mapLink: string | null | undefined): string | null {
  if (!mapLink) return null
  try {
    const url = new URL(mapLink)
    const q = url.searchParams.get("q")
    if (q) return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`
    const atMatch = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (atMatch) return `https://maps.google.com/maps?q=${atMatch[1]},${atMatch[2]}&output=embed`
  } catch {
    return null
  }
  return null
}
