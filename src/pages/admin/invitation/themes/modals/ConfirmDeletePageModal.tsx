import type { FC } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { useThemesMutations } from "../queries"
import type { Themes } from "../types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  page: Themes | null
}

const ConfirmDeletePageModal: FC<Props> = ({ open, onOpenChange, page }) => {
  const { remove } = useThemesMutations()

  const handleConfirm = () => {
    if (!page) return
    remove.mutate(page.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Page</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{page?.name}</strong>? This
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={remove.isPending}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmDeletePageModal
