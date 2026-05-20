import { TriangleAlert } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import SubmitButton from "@/components/custom/form/SubmitButton"
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess"

import { useGuestModalStore } from "../hooks/useGuestModalStore"
import { useGuestMutations } from "../queries"

const GuestDeleteModal = () => {
  const isDeleteOpen = useGuestModalStore((s) => s.isDeleteOpen)
  const selectedItem = useGuestModalStore((s) => s.selectedItem)
  const closeAll = useGuestModalStore((s) => s.closeAll)
  const { remove } = useGuestMutations()

  useCloseOnSuccess(remove.isSuccess, closeAll)

  if (!selectedItem) return null
  const guest = selectedItem

  const handleConfirm = () => remove.mutate(guest.id)

  return (
    <AlertDialog open={isDeleteOpen} onOpenChange={closeAll}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-destructive">
          <AlertDialogTitle className="flex items-center gap-2">
            <TriangleAlert className="w-4 h-4 shrink-0" />
            Remove guest
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
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
          <SubmitButton
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            isPending={remove.isPending}
            isSuccess={remove.isSuccess}
            isError={remove.isError}
          >
            Remove
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default GuestDeleteModal
