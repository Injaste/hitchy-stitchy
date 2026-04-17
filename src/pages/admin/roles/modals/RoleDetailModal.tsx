import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { useAccess } from "../../hooks/useAccess"
import { useRoleModalStore } from "../hooks/useRoleModalStore"
import { CATEGORY_LABELS } from "../types"

const RoleDetailModal = () => {
  const isDetailOpen = useRoleModalStore((s) => s.isDetailOpen)
  const selectedItem = useRoleModalStore((s) => s.selectedItem)
  const closeAll = useRoleModalStore((s) => s.closeAll)
  const openEdit = useRoleModalStore((s) => s.openEdit)
  const openDelete = useRoleModalStore((s) => s.openDelete)

  const { canUpdate, canDelete } = useAccess()

  if (!selectedItem) return null
  const role = selectedItem
  const isRoot = role.category === "root"

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent className="w-[95vw] max-w-lg" aria-describedby="">
        <DialogHeader className="flex flex-row items-center gap-2">
          <DialogTitle>{role.name}</DialogTitle>
          <span>·</span>
          <Badge variant="outline">{role.short_name}</Badge>
        </DialogHeader>

        <div className="space-y-6 mt-1">
          <p className="text-sm text-muted-foreground tracking-wide">
            {CATEGORY_LABELS[role.category]}
          </p>

          <Separator />

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </p>
            {role.description ? (
              <p className="text-sm leading-relaxed">{role.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground/50 italic">
                No description
              </p>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-end gap-2">
            {canDelete("roles") && !isRoot && (
              <Button variant="destructive" size="sm" onClick={openDelete}>
                Delete
              </Button>
            )}
            {canUpdate("roles") && !isRoot && (
              <Button size="sm" onClick={openEdit} autoFocus>
                Edit
              </Button>
            )}
            {isRoot && (
              <p className="text-xs text-muted-foreground italic">
                The root role is permanent and cannot be edited or deleted.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RoleDetailModal
