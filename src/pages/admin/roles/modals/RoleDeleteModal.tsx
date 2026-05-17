import { TriangleAlert } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useRoleModalStore } from "../hooks/useRoleModalStore"
import { useRoleMutations } from "../queries"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"

const RoleDeleteModal = () => {
  const isDeleteOpen = useRoleModalStore((s) => s.isDeleteOpen)
  const selectedItem = useRoleModalStore((s) => s.selectedItem)
  const closeAll = useRoleModalStore((s) => s.closeAll)
  const { eventId } = useAdminStore()
  const { remove } = useRoleMutations()

  if (!selectedItem) return null
  const role = selectedItem

  const handleConfirm = () => {
    remove.mutate({ event_id: eventId!, id: role.id });
  };

  return (
    <AlertDialog open={isDeleteOpen} onOpenChange={closeAll}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-destructive">
          <AlertDialogTitle className="flex items-center gap-2">
            <TriangleAlert className="w-4 h-4 shrink-0" />
            Delete role
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed text-left">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">"{role.name}"</span>?
            Members assigned to this role will lose it, but will remain part of the event.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            variant="outline"
            size="sm"
            onClick={closeAll}
            disabled={remove.isPending}
            autoFocus
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={remove.isPending}
          >
            {remove.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default RoleDeleteModal
