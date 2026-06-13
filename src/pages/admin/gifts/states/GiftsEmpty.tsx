import type { FC } from "react"
import { HandCoins, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import EmptyState from "@/components/custom/states/empty-state"

interface GiftsEmptyProps {
  onAdd: () => void
  canCreate: boolean
  /** Multi-day events scope the empty copy to the selected day. */
  scoped?: boolean
}

const GiftsEmpty: FC<GiftsEmptyProps> = ({ onAdd, canCreate, scoped }) => (
  <EmptyState
    icon={
      <div className="flex size-16 items-center justify-center rounded-full border border-dashed border-primary/20 bg-primary/10">
        <HandCoins className="size-7 text-primary" />
      </div>
    }
    title={scoped ? "No envelopes for this day yet" : "No envelopes yet"}
    description="Record each cash gift as it comes in — ang bao, green packets, shagun — and watch the tally climb."
    action={
      canCreate ? (
        <Button onClick={onAdd} className="gap-1">
          <Plus className="size-4" />
          Add first envelope
        </Button>
      ) : undefined
    }
  />
)

export default GiftsEmpty
