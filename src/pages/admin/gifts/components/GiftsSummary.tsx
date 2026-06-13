import type { FC } from "react"

import { Card, CardContent } from "@/components/ui/card"
import Odometer from "@/components/animations/animate-odometer"

import type { GiftSummary } from "../utils"
import GiftStats from "./GiftStats"

interface GiftsSummaryProps {
  summary: GiftSummary
  /** Active day's name on multi-day events, so the hero reads as the day's
   *  collection rather than the whole-wedding total. */
  scopeLabel?: string
}

/** The running tally. No editable target — gifts have no cap — so the hero is a
 *  live read-only Odometer. */
const GiftsSummary: FC<GiftsSummaryProps> = ({ summary, scopeLabel }) => (
  <Card className="rounded-2xl shadow-sm">
    <CardContent>
      <div className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
        {scopeLabel ? `${scopeLabel} collected` : "Total collected"}
      </div>

      <div className="mt-0.5 flex items-baseline gap-1.5">
        <span className="text-sm font-semibold text-muted-foreground">S$</span>
        <span className="font-display text-3xl font-bold tabular-nums">
          <Odometer value={summary.total} group />
        </span>
      </div>

      <GiftStats summary={summary} />
    </CardContent>
  </Card>
)

export default GiftsSummary
