import Papa from "papaparse"
import { format } from "date-fns"

import type { Guest } from "./types"

const EXPORT_COLUMNS = [
  "name",
  "phone",
  "guest_count",
  "status",
  "message",
  "created_at",
] as const

/** Serialises the given guests to a downloadable CSV (papaparse handles quoting). */
export function exportGuestsCSV(guests: Guest[]) {
  const rows = guests.map((g) => ({
    name: g.name,
    phone: g.phone,
    guest_count: g.guest_count,
    status: g.status,
    message: g.message ?? "",
    created_at: format(new Date(g.created_at), "yyyy-MM-dd HH:mm"),
  }))

  const csv = Papa.unparse(rows, { columns: [...EXPORT_COLUMNS] })
  // BOM makes Excel read UTF-8 correctly on Windows.
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  triggerDownload(blob, `guests-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`)
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
