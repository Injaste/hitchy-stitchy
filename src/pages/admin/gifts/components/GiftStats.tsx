import type { FC } from "react"

import { Separator } from "@/components/ui/separator"
import Odometer from "@/components/animations/animate-odometer"
import { cn } from "@/lib/utils"

import { formatSGD } from "@/lib/money"
import { type GiftSummary } from "../utils"

const Stat: FC<{ k: string; value: number; money?: boolean }> = ({
  k,
  value,
  money,
}) => (
  <div className="min-w-0">
    <div className="text-2xs font-medium text-muted-foreground">{k}</div>
    <div className="mt-0.5 font-display text-sm font-bold tabular-nums whitespace-nowrap">
      {money ? (
        <Odometer value={value} prefix="S$" group />
      ) : (
        <Odometer value={value} group />
      )}
    </div>
  </div>
)

/** Break-even strip (only when a comparable catering cost exists) + the three
 *  headline figures. */
const GiftStats: FC<{ summary: GiftSummary }> = ({ summary }) => {
  const { count, avg, largest, costToCover, coverPct, toBreakEven } = summary
  const brokeEven = toBreakEven !== null && toBreakEven <= 0

  return (
    <>
      {costToCover !== null && (
        <>
          <div className="relative mt-3 mb-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-500 ease-out"
              style={{ width: `${coverPct * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Covers {Math.round(coverPct * 100)}% of budget</span>
            <span className={cn(brokeEven && "font-medium text-success")}>
              {brokeEven
                ? "Broken even 🎉"
                : `${formatSGD(toBreakEven ?? 0)} to break even`}
            </span>
          </div>
        </>
      )}

      <Separator className="mt-3.5" />
      <div className="mt-3.5 grid grid-cols-3 gap-3">
        <Stat k="Packets" value={count} />
        <Stat k="Avg / packet" value={Math.round(avg)} money />
        <Stat k="Largest" value={largest} money />
      </div>
    </>
  )
}

export default GiftStats
