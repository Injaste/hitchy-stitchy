import { useEffect, type ReactNode } from "react"

import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox"
import FieldShell from "@/components/custom/form/fields/FieldShell"
import { cssFontFamily } from "@/pages/wedding/templates/utils/google-font-url"
import {
  CURATED_FONTS,
  curatedPreviewStylesheetUrl,
} from "@/pages/wedding/templates/engine/fonts"
import { useThemeSheetStore } from "../store"

interface FontSelectFieldProps {
  name: string
  label?: ReactNode
  hint?: ReactNode
  placeholder?: string
}

const FAMILIES = CURATED_FONTS.map((f) => f.family)
const STYLE_BY_FAMILY = new Map(
  CURATED_FONTS.map((f) => [f.family, cssFontFamily(f.family, f.generic)]),
)
const PREVIEW_ATTR = "data-font-preview"

// Searchable font picker over the curated catalogue. Each option previews in its
// own typeface. HOVERING an option live-previews it on the invite (via a
// transient preview patch) WITHOUT changing the selection or marking the theme
// dirty; the value only commits on CLICK. Closing the popup clears the preview.
const FontSelectField = ({
  name,
  label,
  hint,
  placeholder = "Select a font…",
}: FontSelectFieldProps) => {
  const setPreviewPatch = useThemeSheetStore((s) => s.setPreviewPatch)

  useEffect(() => {
    if (document.head.querySelector(`link[${PREVIEW_ATTR}]`)) return
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = curatedPreviewStylesheetUrl()
    link.setAttribute(PREVIEW_ATTR, "")
    document.head.appendChild(link)
  }, [])

  // Drop the preview override when this field unmounts (e.g. sheet closes).
  useEffect(() => () => setPreviewPatch(null), [setPreviewPatch])

  return (
    <FieldShell name={name} label={label} hint={hint}>
      {(field) => (
        <Combobox
          value={field.state.value || null}
          onOpenChange={(open) => {
            // Closing (cancel OR after a pick) drops the preview override; the
            // committed value drives the preview from here.
            if (!open) setPreviewPatch(null)
          }}
          onValueChange={(v) => {
            field.handleChange(v || "")
            field.handleBlur()
            setPreviewPatch(null)
          }}
          // Highlight (keyboard arrows OR mouse hover) live-previews on the
          // invite — preview only, never the selection. Cleared when nothing is
          // highlighted, so the committed font shows again.
          onItemHighlighted={(itemValue) =>
            setPreviewPatch(itemValue ? { [name]: itemValue } : null)
          }
          items={FAMILIES}
          autoHighlight
        >
          <ComboboxInput
            placeholder={placeholder}
            showClear={!!field.state.value}
          />
          <ComboboxContent>
            <ComboboxEmpty>No fonts found.</ComboboxEmpty>
            <ComboboxList>
              {(family: string) => (
                <ComboboxItem
                  key={family}
                  value={family}
                  style={{ fontFamily: STYLE_BY_FAMILY.get(family) }}
                >
                  {family}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )}
    </FieldShell>
  )
}

export default FontSelectField
