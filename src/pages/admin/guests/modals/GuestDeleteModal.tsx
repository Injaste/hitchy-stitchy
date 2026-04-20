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

import { useGuestModalStore } from "../hooks/useGuestModalStore"
import { useGuestMutations } from "../queries"

const GuestDeleteModal = () => {
  const isDeleteOpen = useGuestModalStore((s) => s.isDeleteOpen)
  const selectedItem = useGuestModalStore((s) => s.selectedItem)
  const closeAll = useGuestModalStore((s) => s.closeAll)
  const { remove } = useGuestMutations()

  if (!selectedItem) return null
  const guest = selectedItem

  return (
    <AlertDialog open={isDeleteOpen} onOpenChange={closeAll}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-destructive">
          <AlertDialogTitle className="flex items-center gap-2">
            <TriangleAlert className="w-4 h-4 shrink-0" />
            Remove guest
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed text-left">
            Are you sure you want to remove{" "}
            <span className="font-semibold text-foreground">"{guest.name}"</span>{" "}
            from your guest list? This action cannot be undone.
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
            onClick={() => remove.mutate(guest.id)}
            disabled={remove.isPending}
          >
            {remove.isPending ? "Removing…" : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default GuestDeleteModal
