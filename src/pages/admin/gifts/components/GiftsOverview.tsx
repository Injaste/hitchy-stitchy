import type { FC } from "react"
import { Sparkles } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

import { formatNum } from "@/lib/money"
import { type GiftSummary } from "../utils"
import GiftStats from "./GiftStats"

interface GiftsOverviewProps {
  summary: GiftSummary
  dayCount: number
}

/** Whole-wedding roll-up across every day — the headline tally. Read-only; the
 *  total is just the sum of every day's gifts. */
const GiftsOverview: FC<GiftsOverviewProps> = ({ summary, dayCount }) => (
  <Card className="rounded-2xl border-primary/15 bg-primary/5 shadow-sm">
    <CardContent>
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-primary/80">
          <Sparkles className="size-3.5" />
          Whole wedding
        </div>
        <span className="text-2xs font-medium text-muted-foreground">
          {dayCount} days
        </span>
      </div>

      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-sm font-semibold text-muted-foreground">S$</span>
        <span className="font-display text-3xl font-bold tabular-nums">
          {formatNum(summary.total)}
        </span>
      </div>

      <GiftStats summary={summary} />
    </CardContent>
  </Card>
)

export default GiftsOverview
