import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type FC,
  type ReactNode,
} from "react"
import { AnimatePresence } from "framer-motion"

import ComponentFade from "@/components/animations/animate-component-fade"
import ScrollGradient from "@/components/custom/scroll-gradient"
import { useScrollVisibility } from "@/hooks/use-scroll-visibility"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// The responsive grid-cols class (e.g. "grid-cols-[…] sm:grid-cols-[…]") is the
// single source of column widths, shared by the header, every row, and the total
// footer so they can never drift out of alignment. It rides a context rather than
// a prop because the rows are passed in as children by the feature — threading it
// through each one by hand would be noise.
const DataTableGridContext = createContext<string | null>(null)

export function useDataTableGrid(): string {
  const cols = useContext(DataTableGridContext)
  if (cols === null)
    throw new Error("useDataTableGrid must be used within <DataTable>")
  return cols
}

export interface DataTableColumn {
  label?: ReactNode
  align?: "right"
  /** Drop the column below the `sm` breakpoint (pair with a narrower mobile grid). */
  hideBelowSm?: boolean
  /** Extra classes on the header cell — e.g. `flex items-center` for a checkbox. */
  className?: string
}

interface DataTableProps {
  /** grid-cols template, e.g. "grid-cols-[minmax(0,1fr)_5rem] sm:grid-cols-[…]". */
  colsClass: string
  columns: DataTableColumn[]
  /** Rows — typically `items.map(…)`. Wrapped in AnimatePresence here. */
  children: ReactNode
  /** Total/summary row pinned under the body; omit when there's nothing to total. */
  footer?: ReactNode
  /** When set with `isEmpty`, replaces the body+footer with a centred message. */
  emptyMessage?: ReactNode
  isEmpty?: boolean
  /**
   * Cap the body at a fixed height with an internally-scrolling list under a
   * pinned header + footer (e.g. the guest list). Without it the table grows
   * with its rows.
   */
  fill?: boolean
  /** Max height (px) of the scrolling body in `fill` mode. Defaults to 500. */
  maxBodyHeight?: number
  className?: string
}

const GRID = "grid gap-x-2"
const HEADER_CLASS =
  "border-b border-border bg-muted py-2.5 pr-3 pl-4 text-2xs font-semibold uppercase tracking-wide text-muted-foreground"

interface HeaderBarProps {
  columns: DataTableColumn[]
  colsClass: string
  style?: CSSProperties
}

const HeaderBar: FC<HeaderBarProps> = ({ columns, colsClass, style }) => (
  <div className={cn(GRID, colsClass, HEADER_CLASS)} style={style}>
    {columns.map((col, i) => (
      <span
        key={i}
        className={cn(
          col.hideBelowSm && "hidden sm:block",
          col.align === "right" && "text-right",
          col.className,
        )}
      >
        {col.label}
      </span>
    ))}
  </div>
)

// The body swaps between the no-match message and the rows with a blur
// crossfade. The message is sized to one row (min-h-14) so fading in/out doesn't
// change the frame height — a seamless transition. Shared by both table variants
// so the empty state looks and animates identically everywhere.
const DataTableBody: FC<{
  children: ReactNode
  emptyMessage?: ReactNode
  isEmpty?: boolean
}> = ({ children, emptyMessage, isEmpty }) => (
  <AnimatePresence mode="wait" initial={false}>
    {emptyMessage != null && isEmpty ? (
      <ComponentFade key="empty" useBlur>
        <div className="flex min-h-14 items-center justify-center text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      </ComponentFade>
    ) : (
      <ComponentFade key="rows" useBlur>
        <AnimatePresence initial={false}>{children}</AnimatePresence>
      </ComponentFade>
    )}
  </AnimatePresence>
)

// The fixed-height variant: a pinned header over an internally-scrolling body,
// with edge fades. Split out so its scroll/measure hooks only mount when a table
// actually fills its container — the grow variant pays nothing for them.
const DataTableFill: FC<DataTableProps> = ({
  colsClass,
  columns,
  children,
  footer,
  emptyMessage,
  isEmpty = false,
  maxBodyHeight = 500,
  className,
}) => {
  const { scrollRef, canScrollUp, canScrollDown, onScroll } =
    useScrollVisibility()

  // The scrolling body reserves a scrollbar gutter that the static header and
  // footer above/below it don't. Measure that gutter so we can (a) pad the
  // header's trailing edge to keep its right-aligned column lined up with the
  // rows, and (b) inset the edge fades so they don't tint the scrollbar.
  const [scrollbarWidth, setScrollbarWidth] = useState(0)
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const measure = () => setScrollbarWidth(el.offsetWidth - el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [scrollRef])

  return (
    <Card className={cn("relative gap-0 py-0", className)}>
      {/* Header sits *above* the scroll box so the scrollbar runs alongside the
          rows only, never across the header. Pad its right edge by the gutter so
          its columns stay aligned with the rows (which are inset by it). */}
      <HeaderBar
        columns={columns}
        colsClass={colsClass}
        style={{ paddingRight: `calc(0.75rem + ${scrollbarWidth}px)` }}
      />
      <div className="relative">
        <ScrollGradient
          side="top"
          visible={canScrollUp}
          style={{ right: scrollbarWidth }}
        />
        <div
          ref={scrollRef}
          onScroll={onScroll}
          style={{ maxHeight: maxBodyHeight }}
          className="overflow-y-auto [scrollbar-width:thin]"
        >
          <DataTableBody emptyMessage={emptyMessage} isEmpty={isEmpty}>
            {children}
          </DataTableBody>
        </div>
        <ScrollGradient
          side="bottom"
          visible={canScrollDown}
          style={{ right: scrollbarWidth }}
        />
      </div>
      {footer}
    </Card>
  )
}

const DataTable: FC<DataTableProps> = (props) => {
  const {
    colsClass,
    columns,
    children,
    footer,
    emptyMessage,
    isEmpty = false,
    fill,
    className,
  } = props

  return (
    <DataTableGridContext.Provider value={colsClass}>
      {fill ? (
        <DataTableFill {...props} />
      ) : (
        <Card className={cn("gap-0 py-0", className)}>
          <HeaderBar columns={columns} colsClass={colsClass} />

          {/* Only the body blur-swaps between the no-match message and the rows;
              the header above and the footer below stay mounted so the total is
              always shown — even at zero results — and the frame never jumps. */}
          <DataTableBody emptyMessage={emptyMessage} isEmpty={isEmpty}>
            {children}
          </DataTableBody>

          {footer}
        </Card>
      )}
    </DataTableGridContext.Provider>
  )
}

export default DataTable
