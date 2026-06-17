import { useEffect, useMemo, type CSSProperties } from "react"
import { useFrame } from "react-frame-component"
import { cssFontFamily, type ParsedGoogleFont } from "../utils/google-font-url"

// The four font slots a template exposes as CSS variables on its root element.
// A template declares defaults for these and maps the couple's config URLs into
// them; the engine injects the <link>s/<style> and returns the root style with
// the variables set. Slots a template doesn't use are simply omitted.
export type ThemeFontSlot = "couple" | "heading" | "body" | "number"
export type ThemeFonts = Partial<Record<ThemeFontSlot, ParsedGoogleFont>>

const FONT_VAR: Record<ThemeFontSlot, string> = {
  couple: "--theme-font-couple",
  heading: "--theme-font-heading",
  body: "--theme-font-body",
  number: "--theme-font-number",
}

interface UseThemeAssetsOptions {
  /** The template's scoped stylesheet, imported via `?inline`. */
  css: string
  /** Resolved fonts per slot (template default merged with couple overrides). */
  fonts: ThemeFonts
}

// Injects a template's stylesheet + Google-font <link>s into the correct
// document — the parent document on the public page, or the iframe document
// inside the admin editor preview (react-frame-component) — and returns the
// root style carrying the --theme-font-* variables the stylesheet consumes.
// `useFrame()` returns an empty object outside a <Frame>, so this is safe in
// both contexts.
export function useThemeAssets({ css, fonts }: UseThemeAssetsOptions): CSSProperties {
  const { document: frameDoc } = useFrame()

  const fontUrls = useMemo(
    () => [
      ...new Set(
        Object.values(fonts)
          .map((f) => f?.url)
          .filter((u): u is string => !!u),
      ),
    ],
    [fonts],
  )

  // Stylesheet — scoped to this template, removed on unmount.
  useEffect(() => {
    const doc = frameDoc ?? document
    if (!doc?.head) return
    const el = doc.createElement("style")
    el.setAttribute("data-theme-style", "")
    el.textContent = css
    doc.head.appendChild(el)
    return () => el.remove()
  }, [frameDoc, css])

  // Google-font <link>s — deduped against what's already in the head.
  useEffect(() => {
    const doc = frameDoc ?? document
    if (!doc?.head) return
    const added: HTMLLinkElement[] = []
    for (const url of fontUrls) {
      if (doc.head.querySelector(`link[href="${url}"]`)) continue
      const link = doc.createElement("link")
      link.rel = "stylesheet"
      link.href = url
      link.setAttribute("data-theme-font", "")
      doc.head.appendChild(link)
      added.push(link)
    }
    return () => {
      for (const l of added) l.remove()
    }
  }, [frameDoc, fontUrls])

  return useMemo(() => {
    const style: Record<string, string> = {}
    for (const slot of Object.keys(FONT_VAR) as ThemeFontSlot[]) {
      const f = fonts[slot]
      if (f) style[FONT_VAR[slot]] = cssFontFamily(f.family, f.generic)
    }
    return style as CSSProperties
  }, [fonts])
}
