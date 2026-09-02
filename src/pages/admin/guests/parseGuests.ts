import { phoneKey } from "@/lib/phone"

import type { GuestStatus, ImportGuestPayload } from "./types"

/**
 * Paste/CSV import parsing and preview classification. Pure — no React, no
 * network, no app state — so the whole thing can be reasoned about (and tested)
 * on plain strings. The UI feeds it text plus what it knows about the target
 * pages and the existing list, and gets back one row per source line with the
 * verdict already decided.
 */

/** The columns an import reads. Anything else in the source is ignored. */
export type ImportField = "name" | "phone" | "guest_count" | "status"

/** One entry per source column: the field it feeds, or null to ignore it. */
export type ColumnMapping = (ImportField | null)[]

export const IMPORT_FIELDS: ImportField[] = ["name", "phone", "guest_count", "status"]

export const IMPORT_FIELD_LABELS: Record<ImportField, string> = {
  name: "Name",
  phone: "Phone",
  guest_count: "Party size",
  status: "Status",
}

// Header names we recognise, normalised (lowercased, punctuation collapsed to
// spaces). Matched EXACTLY, not by substring: "guest" is a name column and
// "guests" is a party size, and a substring test would fold the two together.
const HEADER_ALIASES: Record<ImportField, string[]> = {
  name: ["name", "names", "guest", "guest name", "full name", "nama", "attendee"],
  phone: [
    "phone", "phone no", "phone number", "mobile", "mobile no", "mobile number",
    "hp", "no hp", "contact", "contact no", "contact number", "whatsapp", "tel",
    "telephone",
  ],
  guest_count: [
    "pax", "party", "party size", "guests", "guest count", "count", "seats",
    "qty", "quantity", "no of guests", "number of guests",
  ],
  status: ["status", "rsvp", "rsvp status", "response"],
}

const normaliseHeader = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()

const fieldForHeader = (value: string): ImportField | null => {
  const key = normaliseHeader(value)
  if (!key) return null
  return IMPORT_FIELDS.find((f) => HEADER_ALIASES[f].includes(key)) ?? null
}

// A Google Sheets paste is tab-separated; a saved file is comma-separated; a
// plain one-name-per-line list is neither. Score both separators over the first
// several lines rather than reading one: a title line says nothing about the
// body, and a comma inside a single name ("Tan, Wei Ming") must not turn one
// column into two. A separator wins only if it averages more than one field per
// line — the same bar papaparse's own guesser uses. Null means single column.
const DELIMITERS = ["\t", ","]
const SAMPLE_LINES = 10
// A title is rarely more than a couple of lines. Bounding how many leading
// lines the delimiter skip (below) and the header scan (further down) can
// each reach keeps a wall of title lines, or an alias/delimiter deep in a
// long list, from starving or hijacking detection.
const MAX_TITLE_ROWS = 3

function countFields(line: string, delimiter: string): number {
  let fields = 1
  let quoted = false
  for (const ch of line) {
    if (ch === '"') quoted = !quoted
    else if (!quoted && ch === delimiter) fields++
  }
  return fields
}

// A leading run of lines with no occurrence of this delimiter says nothing
// about whether the delimiter is in play — it's a title line (or several)
// sitting above the real body, and counting its lone field as "1" would drag
// a short list's average below the bar just as hard as a genuine
// single-column paste. Skipped only up to MAX_TITLE_ROWS, and only requiring
// 2+ lines to remain once skipped: without that floor, a single trailing
// comma-bearing line (e.g. "Tan, Wei Ming" as the last of three otherwise
// plain names) gets averaged alone, scores above the bar by itself, and flips
// the whole paste to comma-split — the C-1b regression this guards against.
function averageFields(lines: string[], delimiter: string): number {
  let start = 0
  while (
    start < lines.length &&
    start < MAX_TITLE_ROWS &&
    countFields(lines[start], delimiter) === 1
  ) start++

  const sample = lines.slice(start, start + SAMPLE_LINES)
  if (sample.length < 2) return 0
  return sample.reduce((n, l) => n + countFields(l, delimiter), 0) / sample.length
}

function detectDelimiter(text: string): string | null {
  // The skip has to see the full line list, not a pre-sliced window — slicing
  // to SAMPLE_LINES first would let a run of title lines push real data clean
  // out of the sample before the skip ever runs.
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "")
  if (lines.length === 0) return null

  let best: string | null = null
  let bestAvg = 1.99
  for (const delimiter of DELIMITERS) {
    const avg = averageFields(lines, delimiter)
    if (avg > bestAvg) {
      best = delimiter
      bestAvg = avg
    }
  }
  return best
}

/** A source row and the physical line it started on. */
interface SourceRow {
  line: number
  cells: string[]
}

// RFC4180-shaped scan: a quote only OPENS a field at its start (so an apostrophe
// or a stray quote mid-cell stays literal), a doubled quote inside a quoted field
// is an escaped one, and CRLF / CR / LF all end a row. The line each row started
// on is recorded here, before blank rows are dropped — recomputing it from the
// filtered array would shift every number after the first blank line.
function splitRows(text: string, delimiter: string | null): SourceRow[] {
  const rows: SourceRow[] = []
  let cells: string[] = []
  let cell = ""
  let quoted = false
  let physical = 1
  let start = 1

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (quoted) {
      if (ch !== '"') { if (ch === "\n") physical++; cell += ch }
      else if (text[i + 1] === '"') { cell += '"'; i++ }
      else quoted = false
      continue
    }

    if (ch === '"' && cell.trim() === "") { quoted = true; cell = ""; continue }
    if (delimiter !== null && ch === delimiter) { cells.push(cell); cell = ""; continue }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++
      cells.push(cell)
      rows.push({ line: start, cells })
      cells = []
      cell = ""
      physical++
      start = physical
      continue
    }
    cell += ch
  }

  cells.push(cell)
  rows.push({ line: start, cells })
  return rows
}

export interface ParsedTable {
  /** Header cells when a header row was found, else null. */
  header: string[] | null
  /** Source line the header came from, or null when none was found. Exposed
   *  so the UI can call out which row was consumed as the header (L3) — the
   *  header cells alone don't say "this used to be a data row". */
  headerLine: number | null
  /** Data rows: blank lines dropped, every cell trimmed, source line kept. */
  rows: SourceRow[]
  /** Rows above the header that were discarded as a title line — shown to the
   *  user rather than silently dropped (L3). */
  titleRows: SourceRow[]
  /** Widest row — how many column pickers the preview offers. */
  columnCount: number
  /** Auto-detected mapping. The user can override any entry. */
  mapping: ColumnMapping
}

const EMPTY_TABLE: ParsedTable = {
  header: null,
  headerLine: null,
  rows: [],
  titleRows: [],
  columnCount: 0,
  mapping: [],
}

// Revised bar (the first version shipped four regressions — see phase-c doc):
// a row becomes the header when TWO OR MORE cells alias-match, OR exactly one
// does and it's row 0. Row 0 is trusted on a single match because nothing
// precedes it to distinguish a title from a header; any later row needs
// corroborating matches, because a single alias word is common in real data
// ("Mei Ling,Party" — a party of one — must not be read as a header just
// because "Party" also names a column). The scan itself is bounded: a title
// is rarely more than a line or two, so an alias word on row 300 must not
// consume the 299 rows above it.
function findHeaderIndex(grid: SourceRow[]): number | null {
  const matchCount = (row: SourceRow) =>
    row.cells.filter((cell) => fieldForHeader(cell) !== null).length

  if (matchCount(grid[0]) >= 1) return 0

  for (let i = 1; i < Math.min(grid.length, MAX_TITLE_ROWS); i++) {
    if (matchCount(grid[i]) >= 2) return i
  }

  return null
}

// With a header, each column takes the field its name names (the first column
// wins a contested field). Without one, fall back to the order an exported list
// uses — a visible guess the user can correct beats an empty mapping (L3).
function defaultMapping(header: string[] | null, columnCount: number): ColumnMapping {
  if (!header) {
    return Array.from({ length: columnCount }, (_, i) => IMPORT_FIELDS[i] ?? null)
  }

  const taken = new Set<ImportField>()
  const mapping = Array.from({ length: columnCount }, (_, i) => {
    const field = fieldForHeader(header[i] ?? "")
    if (!field || taken.has(field)) return null
    taken.add(field)
    return field
  })

  // A header whose name column isn't one we recognise ("Attendee Name") would
  // otherwise reject every row as nameless — every import needs a name column
  // to produce a row at all. Column 0 becomes name outright, even if it
  // already matched something else: a lone "Guests" header would otherwise
  // map to guest_count, leave nothing mapped to name, and import zero rows
  // (correctable, unlike an all-rejected preview (L3), is the point).
  if (!taken.has("name") && columnCount > 0) {
    mapping[0] = "name"
  }

  return mapping
}

/** Parses pasted text or CSV file contents into a table plus a starting mapping. */
export function parseGuestText(text: string): ParsedTable {
  // Our own export writes a UTF-8 BOM for Excel; left in place it becomes part of
  // the first header cell and that column stops being recognised.
  const body = text.replace(/^\uFEFF/, "")
  if (!body.trim()) return EMPTY_TABLE

  const grid = splitRows(body, detectDelimiter(body))
    .map((row) => ({ line: row.line, cells: row.cells.map((cell) => cell.trim()) }))
    .filter((row) => row.cells.some((cell) => cell !== ""))

  if (grid.length === 0) return EMPTY_TABLE

  const headerIndex = findHeaderIndex(grid)
  const header = headerIndex !== null ? grid[headerIndex].cells : null
  const headerLine = headerIndex !== null ? grid[headerIndex].line : null
  const titleRows = headerIndex !== null ? grid.slice(0, headerIndex) : []
  const rows = headerIndex !== null ? grid.slice(headerIndex + 1) : grid
  const columnCount = Math.max(...grid.map((row) => row.cells.length))

  return {
    header,
    headerLine,
    rows,
    titleRows,
    columnCount,
    mapping: defaultMapping(header, columnCount),
  }
}

/** Why a row won't be imported (or "ok" when it will). */
export type ImportRowState =
  | "ok"
  | "no-name"
  | "dup-in-batch"
  | "dup-existing"
  | "out-of-bounds"
  | "phone-required"

/** A row-level quality flag that's worth surfacing but not worth blocking on —
 *  the name is still the valuable part, and a wrong number is fixable later. */
export type ImportRowWarning = "bad-phone" | "bad-party-size"

export interface ImportPreviewRow {
  /** Line number in the source, so the user can find the row in their sheet. */
  line: number
  name: string
  phone: string | null
  guest_count: number
  status: GuestStatus
  state: ImportRowState
  /** A value that clearly isn't a phone or a party size — imported anyway. */
  warning: ImportRowWarning | null
  /** Target pages this row is already on — skipped there, imported elsewhere. */
  dupPageIds: string[]
  /** How many target pages this row will actually be written to. */
  writes: number
}

export interface ImportPreviewOptions {
  mapping: ColumnMapping
  /** The pages every imported row will be added to. */
  targetPageIds: string[]
  /**
   * Phones already on each target page, keyed with `phoneKey` — the server
   * compares the same whitespace-stripped shape, so the preview and the write
   * agree on what counts as the same person.
   */
  existingByPage: Map<string, Set<string>>
  /** Party-size intersection across the target pages (max-of-mins, min-of-maxes). */
  minGuest: number
  maxGuest: number
  /** True when a target page is private: every row then needs a phone. */
  phoneRequired: boolean
  /** Status for rows with no status column, or an unreadable value. */
  defaultStatus: GuestStatus
}

export interface ImportPreview {
  rows: ImportPreviewRow[]
  /** The rows that will be sent, in source order. */
  payload: ImportGuestPayload[]
  counts: Record<ImportRowState, number>
  /**
   * What this import costs against the plan: party size counted once per page it
   * lands on, since that is how the cap is measured.
   */
  heads: number
}

const STATUS_VALUES: GuestStatus[] = ["pending", "confirmed", "cancelled"]

const readStatus = (value: string, fallback: GuestStatus): GuestStatus =>
  STATUS_VALUES.find((s) => s === value.trim().toLowerCase()) ?? fallback

// Shared by readCount's fallback and the bad-party-size warning, so the two
// can't drift apart on what counts as a valid party size (e.g. "0" or a
// negative number, which parseInt reads fine but which isn't a real party).
const parsePartySize = (value: string): number | null => {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

const readCount = (value: string): number => parsePartySize(value) ?? 1

const EMPTY_COUNTS: Record<ImportRowState, number> = {
  ok: 0,
  "no-name": 0,
  "dup-in-batch": 0,
  "dup-existing": 0,
  "out-of-bounds": 0,
  "phone-required": 0,
}

/** Resolves every parsed row against the mapping, the target pages and the list
 *  that already exists, and decides which ones are actually importable. */
export function buildImportPreview(
  table: ParsedTable,
  options: ImportPreviewOptions,
): ImportPreview {
  const {
    mapping,
    targetPageIds,
    existingByPage,
    minGuest,
    maxGuest,
    phoneRequired,
    defaultStatus,
  } = options

  const columnOf = (field: ImportField) => mapping.indexOf(field)
  const nameCol = columnOf("name")
  const phoneCol = columnOf("phone")
  const countCol = columnOf("guest_count")
  const statusCol = columnOf("status")

  const seenPhones = new Set<string>()
  const rows: ImportPreviewRow[] = table.rows.map(({ line, cells }) => {
    const cell = (col: number) => (col >= 0 ? (cells[col] ?? "") : "")
    const name = cell(nameCol)
    const phone = cell(phoneCol) || null
    const key = phone ? phoneKey(phone) : null
    const countCell = cell(countCol)
    const guest_count = countCol >= 0 ? readCount(countCell) : 1
    const status =
      statusCol >= 0 ? readStatus(cell(statusCol), defaultStatus) : defaultStatus

    // Not strict validation — formats vary and a partial number is still worth
    // importing — just catching a value that couldn't be a phone at all: no
    // digits (a status word landing in a misdetected column, "N/A", and the
    // like), or a letter mixed into otherwise-digit content ("123445aa"). Both
    // are warnings, not blockers: the name is still worth having even when the
    // phone or party size next to it is junk.
    const badPhone = phone !== null && (!/\d/.test(phone) || /[a-zA-Z]/.test(phone))
    const badPartySize =
      countCol >= 0 &&
      countCell.trim() !== "" &&
      parsePartySize(countCell) === null
    const warning: ImportRowWarning | null = badPhone
      ? "bad-phone"
      : badPartySize
        ? "bad-party-size"
        : null

    const dupPageIds = key
      ? targetPageIds.filter((id) => existingByPage.get(id)?.has(key))
      : []

    // Order matters: the first thing wrong with a row is what the user is told,
    // and a nameless row can't be described any other way.
    const state: ImportRowState = (() => {
      if (!name) return "no-name"
      if (phoneRequired && !phone) return "phone-required"
      if (guest_count < minGuest || guest_count > maxGuest) return "out-of-bounds"
      if (key && seenPhones.has(key)) return "dup-in-batch"
      if (targetPageIds.length > 0 && dupPageIds.length === targetPageIds.length)
        return "dup-existing"
      return "ok"
    })()

    if (key && state === "ok") seenPhones.add(key)

    return {
      line,
      name,
      phone,
      guest_count,
      status,
      state,
      warning,
      dupPageIds,
      writes: state === "ok" ? targetPageIds.length - dupPageIds.length : 0,
    }
  })

  const counts = { ...EMPTY_COUNTS }
  for (const row of rows) counts[row.state]++

  return {
    rows,
    payload: rows
      .filter((r) => r.state === "ok")
      .map(({ name, phone, guest_count, status }) => ({
        name,
        phone,
        guest_count,
        status,
        // Not a mappable import column (no source line carries one) — always
        // null here. GuestBulkPagesSheet is the other ImportGuestPayload
        // producer, and it carries the guest's real message across a move.
        message: null,
      })),
    counts,
    heads: rows.reduce((sum, r) => sum + r.guest_count * r.writes, 0),
  }
}
