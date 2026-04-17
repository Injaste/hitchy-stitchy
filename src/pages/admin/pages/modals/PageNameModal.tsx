import { useState, useEffect, type FC } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import { usePagesMutations } from "../queries"
import type { EventPage } from "../types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  page: EventPage | null
}

const PageNameModal: FC<Props> = ({ open, onOpenChange, page }) => {
  const { rename } = usePagesMutations()
  const [name, setName] = useState(page?.name ?? "")

  useEffect(() => {
    if (open) setName(page?.name ?? "")
  }, [open, page?.name])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!page || !name.trim()) return
    rename.mutate({ id: page.id, name: name.trim() })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Page</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="page-name">Page Name</Label>
            <Input
              id="page-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nikah Page"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || rename.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PageNameModal
