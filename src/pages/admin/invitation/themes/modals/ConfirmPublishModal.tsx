import type { FC } from "react"
import { Globe } from "lucide-react"
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
  hasPublishedPage: boolean
}

const ConfirmPublishModal: FC<Props> = ({ open, onOpenChange, page, hasPublishedPage }) => {
  const { publish } = useThemesMutations()

  const handleConfirm = () => {
    if (!page) return
    publish.mutate(page.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish Page</DialogTitle>
          <DialogDescription>
            {hasPublishedPage
              ? `This will unpublish your current page and publish "${page?.name}" instead. Your invitation link will immediately show the new page.`
              : `"${page?.name}" will become your live invitation page.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={publish.isPending} className="gap-2">
            <Globe className="h-4 w-4" />
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmPublishModal
