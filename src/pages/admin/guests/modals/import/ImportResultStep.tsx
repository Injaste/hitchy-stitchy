import type { FC } from "react"
import { CheckCircle2, AlertTriangle, MinusCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { ImportResult } from "../../types"

interface ImportResultStepProps {
  result: ImportResult
  onClose: () => void
}

const ImportResultStep: FC<ImportResultStepProps> = ({ result, onClose }) => {
  const anyLanded = result.inserted + result.updated > 0
  const allFailed = !anyLanded && result.failed.length > 0

  return (
    <div className="space-y-6 mt-4">
      <div className="flex flex-col items-center text-center gap-3 pt-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full ${
            allFailed ? "bg-destructive/10" : "bg-primary/10"
          }`}
        >
          {allFailed ? (
            <AlertTriangle className="h-6 w-6 text-destructive" />
          ) : (
            <CheckCircle2 className="h-6 w-6 text-primary" />
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {allFailed ? "Import failed" : "Import complete"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {allFailed
              ? "We couldn't save any of the rows. See below for details."
              : "Here's what landed in your guest list."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SummaryTile
          icon={<CheckCircle2 className="w-4 h-4" />}
          label="Added"
          value={result.inserted}
          tone="primary"
        />
        <SummaryTile
          icon={<RefreshCw className="w-4 h-4" />}
          label="Updated"
          value={result.updated}
          tone="primary"
        />
        <SummaryTile
          icon={<MinusCircle className="w-4 h-4" />}
          label="Skipped"
          value={result.skipped}
          tone="muted"
        />
      </div>

      {result.failed.length > 0 && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
          <p className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {result.failed.length} {result.failed.length === 1 ? "row" : "rows"} failed
          </p>
          <ul className="text-xs text-destructive/80 space-y-1 list-disc list-inside max-h-40 overflow-y-auto">
            {result.failed.slice(0, 20).map((f, i) => (
              <li key={i}>
                {f.rowIndex > 0 ? `Row ${f.rowIndex}: ` : ""}
                {f.reason}
              </li>
            ))}
            {result.failed.length > 20 && (
              <li>…and {result.failed.length - 20} more</li>
            )}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  )
}

interface SummaryTileProps {
  icon: React.ReactNode
  label: string
  value: number
  tone: "primary" | "muted"
}

const SummaryTile: FC<SummaryTileProps> = ({ icon, label, value, tone }) => (
  <div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
    <div
      className={`flex items-center justify-center gap-1.5 mb-1 ${
        tone === "primary" ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {icon}
      <span className="text-[11px] uppercase tracking-wide font-medium">{label}</span>
    </div>
    <p className="text-2xl font-semibold text-foreground">{value}</p>
  </div>
)

export default ImportResultStep
