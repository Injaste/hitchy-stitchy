import { useEffect, useMemo, useState, type FC } from "react"
import { AlertCircle, CheckCircle2, MinusCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { useGuestsQuery, useGuestMutations } from "../../queries"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import type {
  Guest,
  ImportAction,
  ImportResult,
  ParsedGuestRow,
  ResolvedGuestRow,
} from "../../types"

interface ImportPreviewStepProps {
  parsed: ParsedGuestRow[]
  onBack: () => void
  onComplete: (result: ImportResult) => void
}

/**
 * Resolve phones against the current cache so admins see conflicts before
 * submitting. Valid, no-conflict rows default to "insert"; conflict rows
 * default to "skip" (safer — never silently overwrites).
 */
function resolveRows(
  parsed: ParsedGuestRow[],
  existing: Guest[] | undefined,
): ResolvedGuestRow[] {
  const byPhone = new Map<string, Guest>()
  existing?.forEach((g) => byPhone.set(g.phone.trim(), g))

  return parsed.map((row) => {
    if (row.errors.length > 0) {
      return { ...row, conflictWith: null, action: "skip" as ImportAction }
    }
    const match = byPhone.get(row.values.phone.trim()) ?? null
    return {
      ...row,
      conflictWith: match,
      action: match ? ("skip" as ImportAction) : ("insert" as ImportAction),
    }
  })
}

const ImportPreviewStep: FC<ImportPreviewStepProps> = ({
  parsed,
  onBack,
  onComplete,
}) => {
  const { eventId } = useAdminStore()
  const { data: existing } = useGuestsQuery()
  const { bulkImport } = useGuestMutations()

  const [resolved, setResolved] = useState<ResolvedGuestRow[]>(() =>
    resolveRows(parsed, existing),
  )

  // If the cache arrives after we mounted, recompute once.
  useEffect(() => {
    setResolved(resolveRows(parsed, existing))
  }, [parsed, existing])

  const counts = useMemo(() => {
    let insert = 0
    let update = 0
    let skip = 0
    let invalid = 0
    resolved.forEach((r) => {
      if (r.errors.length > 0) invalid++
      else if (r.action === "insert") insert++
      else if (r.action === "update") update++
      else skip++
    })
    return { insert, update, skip, invalid, total: resolved.length }
  }, [resolved])

  const conflictCount = useMemo(
    () => resolved.filter((r) => r.conflictWith && r.errors.length === 0).length,
    [resolved],
  )

  const setAction = (rowIndex: number, action: ImportAction) => {
    setResolved((prev) =>
      prev.map((r) => (r.rowIndex === rowIndex ? { ...r, action } : r)),
    )
  }

  const applyToConflicts = (action: "update" | "skip") => {
    setResolved((prev) =>
      prev.map((r) =>
        r.conflictWith && r.errors.length === 0 ? { ...r, action } : r,
      ),
    )
  }

  const applyToInserts = (action: "insert" | "skip") => {
    setResolved((prev) =>
      prev.map((r) =>
        !r.conflictWith && r.errors.length === 0 ? { ...r, action } : r,
      ),
    )
  }

  const canSubmit =
    counts.insert + counts.update > 0 && !bulkImport.isPending && !!eventId

  const handleSubmit = async () => {
    const insertRows = resolved
      .filter((r) => r.action === "insert" && r.errors.length === 0)
      .map((r) => r.values)
    const updateRows = resolved
      .filter(
        (r) => r.action === "update" && r.conflictWith && r.errors.length === 0,
      )
      .map((r) => ({ id: r.conflictWith!.id, values: r.values }))
    const skippedCount = resolved.filter(
      (r) => r.action === "skip" || r.errors.length > 0,
    ).length

    const promise = bulkImport.mutateAsync({
      eventId: eventId!,
      insertRows,
      updateRows,
      skippedCount,
    })

    toast.promise(promise, {
      loading: "Importing guests…",
      success: (r) =>
        `${r.inserted} added · ${r.updated} updated · ${r.skipped} skipped`,
      error: "Import failed",
    })

    try {
      const result = await promise
      onComplete(result)
    } catch {
      // Error toast already surfaced via toast.promise.
    }
  }

  return (
    <div className="space-y-5 mt-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {counts.insert} to add
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <RefreshCw className="w-3 h-3" />
          {counts.update} to update
        </Badge>
        <Badge variant="outline" className="gap-1 text-muted-foreground">
          <MinusCircle className="w-3 h-3" />
          {counts.skip} skipped
        </Badge>
        {counts.invalid > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            {counts.invalid} invalid
          </Badge>
        )}
      </div>

      {(conflictCount > 0 || counts.insert + counts.skip > 0) && (
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5 space-y-2">
          {conflictCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground">
                {conflictCount} phone {conflictCount === 1 ? "already exists" : "already exist"} —
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => applyToConflicts("update")}
              >
                Update all
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => applyToConflicts("skip")}
              >
                Skip all
              </Button>
            </div>
          )}
          {counts.total - conflictCount - counts.invalid > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground">Fresh rows —</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => applyToInserts("insert")}
              >
                Insert all
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => applyToInserts("skip")}
              >
                Skip all
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden max-h-[50vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur">
            <tr className="border-b border-border">
              <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs w-10">
                #
              </th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">
                Name
              </th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">
                Phone
              </th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">
                Guests
              </th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {resolved.map((row) => {
              const invalid = row.errors.length > 0
              return (
                <tr
                  key={row.rowIndex}
                  className={`border-b border-border last:border-0 ${invalid ? "bg-destructive/5" : ""}`}
                >
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {row.rowIndex}
                  </td>
                  <td className="px-3 py-2 text-foreground">
                    {row.values.name || <span className="text-muted-foreground italic">blank</span>}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.values.phone || <span className="italic">blank</span>}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.values.guest_count}
                  </td>
                  <td className="px-3 py-2">
                    {invalid ? (
                      <span className="text-xs text-destructive">
                        {row.errors[0]}
                      </span>
                    ) : row.conflictWith ? (
                      <ActionPicker
                        value={row.action}
                        options={[
                          { value: "update", label: "Update" },
                          { value: "skip", label: "Skip" },
                        ]}
                        onChange={(v) => setAction(row.rowIndex, v)}
                      />
                    ) : (
                      <ActionPicker
                        value={row.action}
                        options={[
                          { value: "insert", label: "Add" },
                          { value: "skip", label: "Skip" },
                        ]}
                        onChange={(v) => setAction(row.rowIndex, v)}
                      />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={bulkImport.isPending}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {bulkImport.isPending
            ? "Importing…"
            : `Import ${counts.insert + counts.update} ${
                counts.insert + counts.update === 1 ? "guest" : "guests"
              }`}
        </Button>
      </div>
    </div>
  )
}

interface ActionPickerProps {
  value: ImportAction
  options: Array<{ value: ImportAction; label: string }>
  onChange: (value: ImportAction) => void
}

const ActionPicker: FC<ActionPickerProps> = ({ value, options, onChange }) => (
  <div className="inline-flex rounded-md border border-border overflow-hidden">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`text-xs px-2.5 py-1 transition-colors ${
          value === opt.value
            ? "bg-primary text-primary-foreground"
            : "bg-transparent text-muted-foreground hover:bg-muted"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
)

export default ImportPreviewStep
