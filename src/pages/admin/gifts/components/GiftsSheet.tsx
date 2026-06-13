import type { FC } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"

import GiftRow, { ROW_COLS } from "./GiftRow"
import { formatSGD } from "@/lib/money"
import type { Gift } from "../types"

const GRID = `grid ${ROW_COLS} gap-x-2`

interface GiftsSheetProps {
  gifts: Gift[]
  total: number
  onRowClick: (gift: Gift) => void
}

const GiftsSheet: FC<GiftsSheetProps> = ({ gifts, total, onRowClick }) => (
  <div className="overflow-hidden rounded-xl border border-border bg-card">
    <div
      className={cn(
        GRID,
        "border-b border-border bg-muted py-2.5 pr-3 pl-4 text-2xs font-semibold uppercase tracking-wide text-muted-foreground",
      )}
    >
      <span>From</span>
      <span>Received as</span>
      <span className="text-right">Amount</span>
    </div>

    <AnimatePresence initial={false}>
      {gifts.map((gift) => (
        <GiftRow key={gift.id} gift={gift} onClick={onRowClick} />
      ))}
    </AnimatePresence>

    <motion.div
      layout
      className={cn(
        GRID,
        "items-center border-t-2 border-foreground/80 bg-muted py-3 pr-3 pl-4 font-bold",
      )}
    >
      <span className="text-xs">
        Total{" "}
        <span className="font-medium text-muted-foreground">
          · {gifts.length} {gifts.length === 1 ? "packet" : "packets"}
        </span>
      </span>
      <span />
      <div className="text-right">
        <div className="font-display text-sm tabular-nums">
          {formatSGD(total)}
        </div>
      </div>
    </motion.div>
  </div>
)

export default GiftsSheet
