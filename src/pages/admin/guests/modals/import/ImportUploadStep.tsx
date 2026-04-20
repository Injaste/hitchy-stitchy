import { useRef, useState, type FC } from "react"
import { Upload, FileText, Download } from "lucide-react"

import { Button } from "@/components/ui/button"

import { parseGuestCSV, downloadGuestTemplate } from "../../utils"
import type { ParsedGuestRow } from "../../types"

interface ImportUploadStepProps {
  onParsed: (rows: ParsedGuestRow[]) => void
  onCancel: () => void
}

const ImportUploadStep: FC<ImportUploadStepProps> = ({ onParsed, onCancel }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parseErrors, setParseErrors] = useState<string[]>([])

  const handleFile = async (file: File) => {
    setFileName(file.name)
    setParseErrors([])
    setIsParsing(true)
    const { rows, parseErrors: errs } = await parseGuestCSV(file)
    setIsParsing(false)
    if (errs.length > 0 && rows.length === 0) {
      setParseErrors(errs)
      return
    }
    setParseErrors(errs)
    onParsed(rows)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-6 mt-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          cursor-pointer rounded-xl border border-dashed
          ${isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/20"}
          px-6 py-12 text-center transition-colors
        `}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted border border-dashed border-border">
          {fileName ? (
            <FileText className="h-6 w-6 text-muted-foreground/70" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground/70" />
          )}
        </div>

        {fileName ? (
          <>
            <p className="text-sm font-medium text-foreground">{fileName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isParsing ? "Reading file…" : "Click to choose a different file"}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">
              Drop your CSV here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Columns: name, phone, guest_count, message
            </p>
          </>
        )}
      </div>

      {parseErrors.length > 0 && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
          <p className="text-xs font-semibold text-destructive mb-1">
            We couldn't read parts of this file
          </p>
          <ul className="text-xs text-destructive/80 space-y-0.5 list-disc list-inside">
            {parseErrors.slice(0, 5).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
            {parseErrors.length > 5 && (
              <li>…and {parseErrors.length - 5} more</li>
            )}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={downloadGuestTemplate}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        Download a sample template
      </button>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default ImportUploadStep
