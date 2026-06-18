import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

export type AnchorTarget = `#${string}` | `action:${string}`

export interface AnchorItemConfig {
  id: string
  label: string
  icon: ComponentType<LucideProps>
  target: AnchorTarget
  when?: (pageConfig: Record<string, unknown>) => boolean
  /** Controls scroll alignment. "center" (default) centres the element in the
   *  viewport; use "start" for tall sections where centering is not useful. */
  scrollBlock?: "center" | "start"
}

export interface AnchorClassNames {
  bar?: string
  item?: string
  icon?: string
  label?: string
  active?: string
}

// Theming for the engine-injected calendar/map drawers. The drawer renders
// inside the template root, so these may use the template's scoped --xx-* vars.
export interface AnchorDrawerClassNames {
  content?: string
  handle?: string
  title?: string
  description?: string
  /** Primary action (filled). */
  button?: string
  /** Secondary action (outline). */
  buttonOutline?: string
  iframe?: string
}

export interface AnchorLabels {
  ariaLabel?: string
  /** Label for the injected calendar anchor item (default "Calendar"). */
  calendar?: string
  /** Label for the injected map anchor item (default "Map"). */
  map?: string
}

export interface AnchorThemeConfig {
  items: AnchorItemConfig[]
  classNames: AnchorClassNames
  drawer: AnchorDrawerClassNames
  labels: AnchorLabels
}
