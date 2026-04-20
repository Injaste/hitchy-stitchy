import Papa from "papaparse"

import { guestFormSchema, type ParsedGuestRow } from "./types"

const HEADER_ALIASES: Record<string, "name" | "phone" | "guest_count" | "message"> = {
  name: "name",
  "full name": "name",
  "guest name": "name",

  phone: "phone",
  "phone number": "phone",
  mobile: "phone",
  contact: "phone",

  guest_count: "guest_count",
  guests: "guest_count",
  "guest count": "guest_count",
  "party size": "guest_count",
  party_size: "guest_count",
  pax: "guest_count",

  message: "message",
  note: "message",
  notes: "message",
  comment: "message",
  comments: "message",
}

interface RawRow {
  [key: string]: string | undefined
}

/**
 * Parses a CSV file uploaded by the admin into validated guest rows.
 * Uses papaparse with header-mode so column order doesn't matter; aliases
 * keep it forgiving for Excel exports and casual header naming.
 */
export function parseGuestCSV(
  file: File,
): Promise<{ rows: ParsedGuestRow[]; parseErrors: string[] }> {
  return new Promise((resolve) => {
    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => {
        const normalised = h.trim().toLowerCase()
        return HEADER_ALIASES[normalised] ?? normalised
      },
      complete: (res) => {
        const parseErrors: string[] = []
        if (res.errors?.length) {
          res.errors.forEach((e) => {
            parseErrors.push(`Row ${(e.row ?? 0) + 1}: ${e.message}`)
          })
        }

        const rows: ParsedGuestRow[] = []
        res.data.forEach((raw, i) => {
          const rowIndex = i + 1
          const name = (raw.name ?? "").trim()
          const phone = (raw.phone ?? "").trim()
          const rawGuestCount = (raw.guest_count ?? "").trim()
          const message = (raw.message ?? "").trim()

          const errors: string[] = []

          // Skip rows that are entirely blank (can happen despite skipEmptyLines).
          if (!name && !phone && !rawGuestCount && !message) return

          let guest_count = 1
          if (rawGuestCount) {
            const parsed = Number(rawGuestCount)
            if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
              errors.push("Guest count must be a whole number")
            } else {
              guest_count = parsed
            }
          }

          const candidate = {
            name,
            phone,
            guest_count,
            message: message || null,
          }

          const schemaResult = guestFormSchema.safeParse(candidate)
          if (!schemaResult.success) {
            schemaResult.error.issues.forEach((issue) => {
              errors.push(issue.message)
            })
          }

          rows.push({
            rowIndex,
            values: schemaResult.success ? schemaResult.data : candidate,
            errors,
          })
        })

        resolve({ rows, parseErrors })
      },
      error: (err) => {
        resolve({ rows: [], parseErrors: [err.message] })
      },
    })
  })
}

const TEMPLATE_CSV = `name,phone,guest_count,message
Ali Hassan,+60123456789,2,
Farah Rahman,+60198765432,1,Looking forward to it
`

export function buildGuestTemplateBlob(): Blob {
  // BOM makes Excel read UTF-8 correctly on Windows.
  return new Blob(["\uFEFF" + TEMPLATE_CSV], {
    type: "text/csv;charset=utf-8;",
  })
}

export function downloadGuestTemplate() {
  const blob = buildGuestTemplateBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "guests-template.csv"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
