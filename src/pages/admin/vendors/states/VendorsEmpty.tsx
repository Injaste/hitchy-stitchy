import type { FC } from "react"
import { Store, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import EmptyState from "@/components/custom/states/empty-state"

interface VendorsEmptyProps {
  onAdd: () => void
  canCreate: boolean
}

const VendorsEmpty: FC<VendorsEmptyProps> = ({ onAdd, canCreate }) => (
  <EmptyState
    icon={
      <div className="flex size-16 items-center justify-center rounded-full border border-dashed border-primary/20 bg-primary/10">
        <Store className="size-7 text-primary" />
      </div>
    }
    title="No vendors yet"
    description="Add the photographer, banquet, florist, emcee and everyone else you've hired — with their contact details all in one place."
    action={
      canCreate ? (
        <Button onClick={onAdd} className="gap-1">
          <Plus className="size-4" />
          Add first vendor
        </Button>
      ) : undefined
    }
  />
)

export default VendorsEmpty
