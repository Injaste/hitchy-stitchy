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

export interface AnchorLabels {
  ariaLabel?: string
}

export interface AnchorThemeConfig {
  items: AnchorItemConfig[]
  classNames: AnchorClassNames
  labels: AnchorLabels
}
