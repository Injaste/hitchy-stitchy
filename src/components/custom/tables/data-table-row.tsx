import type { FC, ReactNode } from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { listItemReveal, listLayoutTransition } from "@/lib/animations"

import { useDataTableGrid } from "./data-table"

interface DataTableRowProps {
  onClick?: () => void
  /** Optional left progress stripe (e.g. budget's payment ramp). */
  stripeColor?: string | null
  /** Override the default cell padding (e.g. a roomier `py-3`). */
  contentClassName?: string
  /** Highlights the row (e.g. a checkbox-selected guest). */
  selected?: boolean
  /**
   * The rendered element. Defaults to a real `<button>`. Use `"div"` when the
   * row contains its own interactive controls (a checkbox, a menu) — a `<button>`
   * may not nest other buttons, so those rows must be a plain clickable div.
   */
  element?: "button" | "div"
  children: ReactNode
}

const ROW_CLASS =
  "relative block w-full cursor-pointer overflow-hidden border-b border-border text-left transition-colors last:border-b-0 hover:bg-accent/40 data-[state=selected]:bg-muted/50"

const DataTableRow: FC<DataTableRowProps> = ({
  onClick,
  stripeColor,
  contentClassName,
  selected,
  element = "button",
  children,
}) => {
  const cols = useDataTableGrid()

  const inner = (
    <>
      {stripeColor && (
        <span
          aria-hidden
          className="absolute top-1.5 bottom-1.5 left-0 w-1 rounded-full"
          style={{ backgroundColor: stripeColor }}
        />
      )}

      {/* Padding lives here, not on the row element, so the height tween can
          collapse the row fully to 0 on exit instead of leaving a padding stub. */}
      <div
        className={cn(
          "grid items-center gap-x-2 py-2.5 pr-3 pl-4",
          cols,
          contentClassName,
        )}
      >
        {children}
      </div>
    </>
  )

  const motionProps = {
    layout: "position" as const,
    variants: listItemReveal,
    initial: "hidden",
    animate: "show",
    exit: "exit",
    transition: listLayoutTransition,
    onClick,
    "data-state": selected ? "selected" : undefined,
    className: ROW_CLASS,
  }

  return element === "div" ? (
    <motion.div {...motionProps}>{inner}</motion.div>
  ) : (
    <motion.button type="button" {...motionProps}>
      {inner}
    </motion.button>
  )
}

export default DataTableRow
