import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";

import ComponentFade from "@/components/animations/animate-component-fade";
import { ScrollView } from "@/components/custom/scroll-view";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { listItemReveal, listLayoutTransition } from "@/lib/animations";

// The responsive grid-cols class (e.g. "grid-cols-[…] sm:grid-cols-[…]") is the
// single source of column widths, shared by the header, every row, and the total
// footer so they can never drift out of alignment. It rides a context rather than
// a prop because the rows are passed in as children by the feature — threading it
// through each one by hand would be noise.
const DataTableGridContext = createContext<string | null>(null);

export function useDataTableGrid(): string {
  const cols = useContext(DataTableGridContext);
  if (cols === null)
    throw new Error("useDataTableGrid must be used within <DataTable>");
  return cols;
}

// Whether rows sit inside a virtualized body. Read by DataTableRow to drop its
// framer motion (which would fight the virtualizer's positioning). Defaults to
// off, so every non-virtual table keeps its animations untouched.
interface DataTableMode {
  virtualized: boolean;
}
const DataTableModeContext = createContext<DataTableMode>({ virtualized: false });
export function useDataTableMode(): DataTableMode {
  return useContext(DataTableModeContext);
}
const VIRTUAL_MODE: DataTableMode = { virtualized: true };

// Above this many rows a `fill` table (with an items/renderRow API) switches from
// the animated children path to a windowed virtual body — only the rows near the
// viewport render, so the DOM stays flat no matter how long the list is. Tuned so
// the common case keeps every animation and only huge lists pay for windowing.
const VIRTUALIZE_THRESHOLD = 100;
// Starting row-height guess for the virtualizer; real heights are measured after
// mount, so this only needs to be in the right ballpark for the initial window.
const ROW_EST = 57;
// Backstop for dropping an exiting ghost if its collapse never reports done —
// e.g. it scrolled out of the window and unmounted before onExitComplete fired.
const EXIT_CLEANUP_MS = 500;

export interface DataTableColumn {
  label?: ReactNode;
  align?: "right";
  /** Drop the column below the `sm` breakpoint (pair with a narrower mobile grid). */
  hideBelowSm?: boolean;
  /** Extra classes on the header cell — e.g. `flex items-center` for a checkbox. */
  className?: string;
}

interface DataTableProps<T> {
  /** grid-cols template, e.g. "grid-cols-[minmax(0,1fr)_5rem] sm:grid-cols-[…]". */
  colsClass: string;
  columns: DataTableColumn[];
  /**
   * Rows as pre-rendered children (`items.map(…)`). Prefer `items`+`renderRow`
   * on a `fill` table so it can virtualize; children never virtualize.
   */
  children?: ReactNode;
  /**
   * Row data. When paired with `renderRow` on a `fill` table, the table owns the
   * mapping and switches to a virtual body past `virtualizeThreshold` rows.
   */
  items?: readonly T[];
  /** Renders one row from its item. Must set a stable `key` (e.g. `item.id`). */
  renderRow?: (item: T) => ReactNode;
  /** Stable row id — powers the virtualizer key + its scroll-vs-create test. */
  getRowId?: (item: T) => string;
  /** Row count at which a `fill` table starts virtualizing. Defaults to 100. */
  virtualizeThreshold?: number;
  /** Total/summary row pinned under the body; omit when there's nothing to total. */
  footer?: ReactNode;
  /** When set with `isEmpty`, replaces the body+footer with a centred message. */
  emptyMessage?: ReactNode;
  isEmpty?: boolean;
  /**
   * Cap the body at a fixed height with an internally-scrolling list under a
   * pinned header + footer (e.g. the guest list). Without it the table grows
   * with its rows.
   */
  fill?: boolean;
  /** Max height (px) of the scrolling body in `fill` mode. Defaults to 500. */
  maxBodyHeight?: number;
  className?: string;
}

const GRID = "grid gap-x-2";
const HEADER_CLASS =
  "border-b border-border bg-muted py-2.5 pr-3 pl-4 text-2xs font-semibold uppercase tracking-wide text-muted-foreground";

interface HeaderBarProps {
  columns: DataTableColumn[];
  colsClass: string;
}

const HeaderBar: FC<HeaderBarProps> = ({ columns, colsClass }) => (
  <div className={cn(GRID, colsClass, HEADER_CLASS)}>
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
);

// The body swaps between the no-match message and the rows with a blur
// crossfade. The message is sized to one row (min-h-14) so fading in/out doesn't
// change the frame height — a seamless transition. Shared by both table variants
// so the empty state looks and animates identically everywhere.
const DataTableBody: FC<{
  children: ReactNode;
  emptyMessage?: ReactNode;
  isEmpty?: boolean;
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
);

interface DataTableFillProps {
  colsClass: string;
  columns: DataTableColumn[];
  children: ReactNode;
  footer?: ReactNode;
  emptyMessage?: ReactNode;
  isEmpty?: boolean;
  maxBodyHeight?: number;
  className?: string;
}

// The fixed-height variant: a pinned header over an internally-scrolling body,
// with edge fades. Split out so its scroll/measure hooks only mount when a table
// actually fills its container — the grow variant pays nothing for them.
const DataTableFill: FC<DataTableFillProps> = ({
  colsClass,
  columns,
  children,
  footer,
  emptyMessage,
  isEmpty = false,
  maxBodyHeight = 500,
  className,
}) => {
  // When the body is scrolled while the card is partly past the page fold, pull
  // the whole card (pinned header → footer) into the page viewport so the table
  // is framed in full, then the body keeps scrolling. `block: "nearest"` is a
  // no-op once the card already fits, so it only moves the page when it has to.
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <Card
      ref={cardRef}
      className={cn("relative scroll-mb-5 gap-0 py-0", className)}
    >
      {/* Header sits *above* the scroll box so the scrollbar runs alongside the
          rows only, never across the header. Its `pr-3` matches the rows' `pr-3`
          — the overlay scrollbar reserves no gutter, so no compensation needed. */}
      <HeaderBar columns={columns} colsClass={colsClass} />
      <ScrollView
        maxHeight={maxBodyHeight}
        gradientTop
        gradientBottom
        gradientClass="from-card"
        onScroll={() => cardRef.current?.scrollIntoView({ block: "nearest" })}
      >
        <DataTableBody emptyMessage={emptyMessage} isEmpty={isEmpty}>
          {children}
        </DataTableBody>
      </ScrollView>
      {footer}
    </Card>
  );
};

interface DataTableFillVirtualProps<T> {
  colsClass: string;
  columns: DataTableColumn[];
  items: readonly T[];
  renderRow: (item: T) => ReactNode;
  getRowId: (item: T) => string;
  footer?: ReactNode;
  maxBodyHeight?: number;
  className?: string;
}

// The virtualized `fill` body: same pinned-header, scrolling-body, edge-fade
// frame as DataTableFill, but only the rows near the viewport are in the DOM.
// TanStack Virtual sizes a spacer to the full list height and positions each
// windowed row by transform, so a 5,000-row list keeps a ~flat DOM.
function DataTableFillVirtual<T>({
  colsClass,
  columns,
  items,
  renderRow,
  getRowId,
  footer,
  maxBodyHeight = 500,
  className,
}: DataTableFillVirtualProps<T>) {
  const cardRef = useRef<HTMLDivElement>(null);
  // OverlayScrollbars owns the scrolling element; hold it in state so the
  // virtualizer picks it up once ScrollView hands it over on init.
  const [viewport, setViewport] = useState<HTMLElement | null>(null);

  // Deferred-unmount buffer. `display` = the live items plus any row just removed
  // from `items`, kept as an "exiting" ghost at its old slot so it stays in the
  // virtualizer's count while its own AnimatePresence collapses it. It's derived
  // *synchronously* when `items` changes (React's adjust-state-during-render), NOT
  // in an effect: an effect would drop the row from the list for one frame,
  // unmounting its AnimatePresence so the exit never plays. Scroll never touches
  // this (rows leaving the window stay in `items`) — a scroll-off just unmounts
  // the wrapper with no exit.
  const [display, setDisplay] = useState(() =>
    items.map((it) => ({ id: getRowId(it), item: it, exiting: false })),
  );
  const prevItems = useRef(items);
  if (prevItems.current !== items) {
    prevItems.current = items;
    const curIds = new Set(items.map((it) => getRowId(it)));
    const next = items.map((it) => ({
      id: getRowId(it),
      item: it,
      exiting: false,
    }));
    display.forEach((entry, i) => {
      if (!curIds.has(entry.id) && !next.some((r) => r.id === entry.id))
        // Reuse the existing entry object when it's already a ghost so an
        // unrelated `items` change mid-collapse can't perturb the running exit.
        next.splice(
          Math.min(i, next.length),
          0,
          entry.exiting ? entry : { id: entry.id, item: entry.item, exiting: true },
        );
    });
    setDisplay(next);
  }

  const dropGhost = useCallback(
    (id: string) => setDisplay((cur) => cur.filter((r) => r.id !== id)),
    [],
  );

  // Backstop: an exiting ghost that scrolls out of the window unmounts its
  // AnimatePresence, so onExitComplete never fires — sweep any lingering ghost.
  useEffect(() => {
    const ghosts = display.filter((r) => r.exiting);
    if (ghosts.length === 0) return;
    const timers = ghosts.map((g) =>
      setTimeout(() => dropGhost(g.id), EXIT_CLEANUP_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [display, dropGhost]);

  const virtualizer = useVirtualizer({
    count: display.length,
    getScrollElement: () => viewport,
    estimateSize: () => ROW_EST,
    getItemKey: (index) => display[index].id,
    overscan: 8,
  });

  // Enter detection: an id we've never seen is a genuine insert → reveal it.
  // Seeded with the first list so first paint is silent; ids recorded after each
  // commit so a row scrolling back into view never re-animates. Read at render so
  // the reveal is set on the row's very first mount.
  const knownIds = useRef<Set<string> | null>(null);
  if (knownIds.current === null)
    knownIds.current = new Set(items.map((it) => getRowId(it)));
  useEffect(() => {
    for (const it of items) knownIds.current!.add(getRowId(it));
  }, [items, getRowId]);

  const virtualItems = virtualizer.getVirtualItems();
  // Resolve rows by the virtualizer's own key, not by index: when a ghost is
  // spliced in, display shifts and a stale index would point at the wrong row.
  const byId = useMemo(() => new Map(display.map((r) => [r.id, r])), [display]);

  return (
    <DataTableModeContext.Provider value={VIRTUAL_MODE}>
      <Card
        ref={cardRef}
        className={cn("relative scroll-mb-5 gap-0 py-0", className)}
      >
        <HeaderBar columns={columns} colsClass={colsClass} />
        <ScrollView
          maxHeight={maxBodyHeight}
          gradientTop
          gradientBottom
          gradientClass="from-card"
          onViewport={setViewport}
          onScroll={() => cardRef.current?.scrollIntoView({ block: "nearest" })}
        >
          <div
            style={{ height: virtualizer.getTotalSize(), position: "relative" }}
          >
            {virtualItems.map((vi) => {
              const row = byId.get(vi.key as string);
              if (!row) return null;
              const isNew =
                !row.exiting && !knownIds.current!.has(row.id);
              return (
                <div
                  key={vi.key}
                  ref={virtualizer.measureElement}
                  data-index={vi.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${vi.start}px)`,
                  }}
                >
                  {/* Per-row AnimatePresence: nulling the child on delete fires its
                      `exit` (height + opacity, overflow-clipped) — the reliable path,
                      unlike toggling an animate variant. A scroll-off instead drops
                      the whole wrapper, so nothing animates. The virtualizer
                      re-measures each frame, so neighbours slide. A new row reveals
                      from its first mount; a scrolled-in row mounts at rest. */}
                  <AnimatePresence onExitComplete={() => dropGhost(row.id)}>
                    {!row.exiting && (
                      <motion.div
                        key="row"
                        variants={listItemReveal}
                        initial={isNew ? "hidden" : false}
                        animate="show"
                        exit="exit"
                        transition={listLayoutTransition}
                        style={{ overflow: "hidden" }}
                      >
                        {renderRow(row.item)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </ScrollView>
        {footer}
      </Card>
    </DataTableModeContext.Provider>
  );
}

const defaultGetRowId = (item: unknown): string =>
  (item as { id: string }).id;

function DataTable<T>(props: DataTableProps<T>) {
  const {
    colsClass,
    columns,
    children,
    items,
    renderRow,
    getRowId = defaultGetRowId,
    virtualizeThreshold = VIRTUALIZE_THRESHOLD,
    footer,
    emptyMessage,
    isEmpty = false,
    fill,
    maxBodyHeight,
    className,
  } = props;

  // A data-driven `fill` table windows itself once the list is long enough that
  // rendering every row costs more than it's worth.
  if (
    fill &&
    items != null &&
    renderRow != null &&
    items.length >= virtualizeThreshold
  ) {
    return (
      <DataTableGridContext.Provider value={colsClass}>
        <DataTableFillVirtual
          colsClass={colsClass}
          columns={columns}
          items={items}
          renderRow={renderRow}
          getRowId={getRowId}
          footer={footer}
          maxBodyHeight={maxBodyHeight}
          className={className}
        />
      </DataTableGridContext.Provider>
    );
  }

  // Below the threshold (or a children-based caller) the rows render the same
  // animated way they always have.
  const rows =
    items != null && renderRow != null ? items.map(renderRow) : children;

  return (
    <DataTableGridContext.Provider value={colsClass}>
      {fill ? (
        <DataTableFill
          colsClass={colsClass}
          columns={columns}
          footer={footer}
          emptyMessage={emptyMessage}
          isEmpty={isEmpty}
          maxBodyHeight={maxBodyHeight}
          className={className}
        >
          {rows}
        </DataTableFill>
      ) : (
        <Card className={cn("gap-0 py-0", className)}>
          <HeaderBar columns={columns} colsClass={colsClass} />

          {/* Only the body blur-swaps between the no-match message and the rows;
              the header above and the footer below stay mounted so the total is
              always shown — even at zero results — and the frame never jumps. */}
          <DataTableBody emptyMessage={emptyMessage} isEmpty={isEmpty}>
            {rows}
          </DataTableBody>

          {footer}
        </Card>
      )}
    </DataTableGridContext.Provider>
  );
}

export default DataTable;
