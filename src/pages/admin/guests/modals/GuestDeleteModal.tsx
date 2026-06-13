import ConfirmAlertModal from "@/components/custom/confirm-alert-modal"
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess"

import { useGuestModalStore } from "../hooks/useGuestModalStore"
import { useGuestMutations } from "../queries"

const GuestDeleteModal = () => {
  const isDeleteOpen = useGuestModalStore((s) => s.isDeleteOpen)
  const selectedItem = useGuestModalStore((s) => s.selectedItem)
  const closeAll = useGuestModalStore((s) => s.closeAll)
  const selectedIds = useGuestModalStore((s) => s.selectedIds)
  const setSelectedIds = useGuestModalStore((s) => s.setSelectedIds)
  const { remove } = useGuestMutations()

  // Drop the removed guest from any active selection so it doesn't linger as a
  // phantom in the bulk-bar count once its row is gone.
  useCloseOnSuccess(remove.isSuccess, () => {
    if (selectedItem && selectedIds.has(selectedItem.id)) {
      const next = new Set(selectedIds)
      next.delete(selectedItem.id)
      setSelectedIds(next)
    }
    closeAll()
  })

  if (!selectedItem) return null
  const guest = selectedItem

  const handleConfirm = () => {
    remove.mutate({ id: guest.id, name: guest.name })
  }

  return (
    <ConfirmAlertModal
      open={isDeleteOpen}
      onOpenChange={closeAll}
      variant="destructive"
      title="Remove guest"
      description={
        <>
          Are you sure you want to remove{" "}
          <span className="font-semibold text-foreground">"{guest.name}"</span>{" "}
          from your guest list? This action cannot be undone.
        </>
      }
      confirmLabel="Remove"
      onConfirm={handleConfirm}
      isPending={remove.isPending}
      isSuccess={remove.isSuccess}
      isError={remove.isError}
    />
  )
}

export default GuestDeleteModal
