import type { FC } from "react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable, {
  type DataTableColumn,
  useDataTableGrid,
} from "@/components/custom/tables/data-table";

import { STATUS_LABELS } from "../types";
import type { GuestPageOption } from "../pageOptions";
import PageChecklist from "../components/PageChecklist";
import {
  IMPORT_FIELDS,
  IMPORT_FIELD_LABELS,
  type ColumnMapping,
  type ImportField,
  type ImportPreview,
  type ImportPreviewRow,
  type ImportRowWarning,
  type ParsedTable,
} from "../parseGuests";

// Sentinel for "don't read this column" — Radix Select can't hold an empty value.
const IGNORE = "__ignore__";

const PREVIEW_COLS =
  "grid-cols-[minmax(0,1fr)_2.5rem_7rem] sm:grid-cols-[2.5rem_minmax(0,1fr)_7rem_3rem_5rem_9rem]";

const COLUMNS: DataTableColumn[] = [
  { label: "Row", hideBelowSm: true },
  { label: "Guest" },
  { label: "Phone", hideBelowSm: true },
  { label: "Party" },
  { label: "Status", hideBelowSm: true },
  { label: "Note" },
];

/** What each verdict is called in the preview. Neutral: these are outcomes the
 *  user needs to act on, not failures to apologise for (L7). */
const STATE_NOTE: Record<Exclude<ImportPreviewRow["state"], "ok">, string> = {
  "no-name": "No name",
  "dup-in-batch": "Repeated in this list",
  "dup-existing": "Already on your list",
  "out-of-bounds": "Party size not allowed",
  "phone-required": "Phone needed",
};

/** Row-level quality flags — shown same as a skip reason, but the row still
 *  imports (the name is worth having even when this one field is junk). */
const WARNING_NOTE: Record<ImportRowWarning, string> = {
  "bad-phone": "Not a phone number",
  "bad-party-size": "Party size isn't a number",
};

const PreviewRow: FC<{ row: ImportPreviewRow; note: string | null }> = ({
  row,
  note,
}) => {
  const cols = useDataTableGrid();
  const skipped = row.state !== "ok";
  const flagged = skipped || row.warning !== null;

  return (
    <div
      className={cn(
        "grid items-center gap-x-2 border-b border-border py-2 pr-3 pl-4 text-sm last:border-b-0",
        cols,
        skipped && "opacity-60",
      )}
    >
      <span className="hidden text-xs tabular-nums text-muted-foreground sm:block">
        {row.line}
      </span>
      <span className="min-w-0 truncate font-medium">
        {row.name || <span className="text-muted-foreground">No name</span>}
      </span>
      <span className="hidden min-w-0 truncate text-xs text-muted-foreground sm:block">
        {row.phone}
      </span>
      <span className="tabular-nums text-muted-foreground">
        {row.guest_count}
      </span>
      <span className="hidden text-xs text-muted-foreground sm:block">
        {STATUS_LABELS[row.status]}
      </span>
      <span
        className={cn(
          "min-w-0 truncate text-xs",
          flagged ? "text-warning" : "text-muted-foreground",
        )}
      >
        {note}
      </span>
    </div>
  );
};

interface GuestImportPreviewProps {
  table: ParsedTable;
  preview: ImportPreview;
  mapping: ColumnMapping;
  onMappingChange: (mapping: ColumnMapping) => void;
  /** Pages the import can target (the day in view). */
  pages: GuestPageOption[];
  targetIds: string[];
  onToggleTarget: (id: string) => void;
}

/** The shared half of both doors: pick the target pages, say what each column
 *  is, then read every row and its verdict before anything is written. */
const GuestImportPreview: FC<GuestImportPreviewProps> = ({
  table,
  preview,
  mapping,
  onMappingChange,
  pages,
  targetIds,
  onToggleTarget,
}) => {
  const labelById = new Map(pages.map((p) => [p.id, p.label]));

  // A field belongs to one column, so assigning it here takes it off whichever
  // column held it before — otherwise two columns silently feed the same field
  // and the second one wins with no sign of it.
  const assign = (index: number, field: ImportField | null) =>
    onMappingChange(
      mapping.map((current, i) =>
        i === index ? field : current === field ? null : current,
      ),
    );

  const noteFor = (row: ImportPreviewRow): string | null => {
    if (row.state !== "ok") return STATE_NOTE[row.state];
    if (row.warning) return WARNING_NOTE[row.warning];
    if (row.dupPageIds.length === 0) return null;
    return `Already on ${row.dupPageIds.map((id) => labelById.get(id) ?? "a page").join(", ")}`;
  };

  const { counts, heads } = preview;
  const skipped = preview.rows.length - counts.ok;
  const skipReasons = [
    counts["dup-existing"] && `${counts["dup-existing"]} already on your list`,
    counts["dup-in-batch"] && `${counts["dup-in-batch"]} repeated in this list`,
    counts["no-name"] && `${counts["no-name"]} with no name`,
    counts["out-of-bounds"] &&
      `${counts["out-of-bounds"]} outside the party-size limits`,
    counts["phone-required"] && `${counts["phone-required"]} with no phone`,
  ].filter(Boolean) as string[];

  return (
    <div className="grid gap-3">
      {pages.length > 1 && (
        <div className="grid gap-2 px-4">
          <p className="text-xs font-medium text-foreground">Add to pages</p>
          <PageChecklist
            pages={pages}
            selectedIds={targetIds}
            onToggle={onToggleTarget}
          />
        </div>
      )}

      {table.columnCount > 1 && (
        <div className="grid grid-cols-2 gap-2 px-4 sm:grid-cols-4">
          {Array.from({ length: table.columnCount }, (_, i) => (
            <div key={i} className="min-w-0 space-y-1">
              <p className="truncate text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                {table.header?.[i]?.trim() || `Column ${i + 1}`}
              </p>
              <Select
                value={mapping[i] ?? IGNORE}
                onValueChange={(v) =>
                  assign(i, v === IGNORE ? null : (v as ImportField))
                }
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={IGNORE}>Ignore</SelectItem>
                  {IMPORT_FIELDS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {IMPORT_FIELD_LABELS[f]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-0.5 px-4">
        <p className="text-sm text-foreground">
          <span className="font-medium">{counts.ok}</span> of{" "}
          {preview.rows.length} rows ready
          {targetIds.length > 0 && (
            <span className="text-muted-foreground">
              {" "}
              — {heads} guests on {targetIds.length}{" "}
              {targetIds.length === 1 ? "page" : "pages"}
            </span>
          )}
        </p>
        {skipped > 0 && (
          <p className="text-xs text-muted-foreground">
            {skipped} skipped: {skipReasons.join(" · ")}
          </p>
        )}
      </div>

      <DataTable
        fill
        maxBodyHeight={260}
        className="mx-4"
        colsClass={PREVIEW_COLS}
        columns={COLUMNS}
        items={preview.rows}
        getRowId={(row) => String(row.line)}
        renderRow={(row) => (
          <PreviewRow key={row.line} row={row} note={noteFor(row)} />
        )}
      />
    </div>
  );
};

export default GuestImportPreview;
