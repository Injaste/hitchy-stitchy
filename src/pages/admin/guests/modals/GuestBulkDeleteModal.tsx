import ConfirmAlertModal from "@/components/custom/confirm-alert-modal"
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess"

import { useGuestModalStore } from "../hooks/useGuestModalStore"
import { useGuestMutations } from "../queries"

// Bulk delete stays confirm-gated (unlike bulk status, which is undo) — a
// hard delete with no reversal, and bulk scale raises the stakes enough to
// warrant type-to-confirm, same tier as the member/theme deletes.
const GuestBulkDeleteModal = () => {
  const isOpen = useGuestModalStore((s) => s.isBulkDeleteOpen)
  const ids = useGuestModalStore((s) => s.bulkDeleteIds)
  const closeAll = useGuestModalStore((s) => s.closeAll)
  const clearSelection = useGuestModalStore((s) => s.clearSelection)
  const { removeMany } = useGuestMutations()

  useCloseOnSuccess(removeMany.isSuccess, () => {
    clearSelection()
    closeAll()
  })

  if (ids.length === 0) return null

  const guestNoun = ids.length === 1 ? "guest" : "guests"
  const confirmPhrase = `delete ${ids.length} ${guestNoun}`

  const handleConfirm = () => {
    removeMany.mutate({ ids })
  }

  return (
    <ConfirmAlertModal
      open={isOpen}
      onOpenChange={closeAll}
      variant="destructive"
      title={`Delete ${ids.length} ${guestNoun}?`}
      description="This removes their RSVP details entirely. This action cannot be undone."
      confirmPhrase={confirmPhrase}
      confirmLabel="Delete"
      onConfirm={handleConfirm}
      isPending={removeMany.isPending}
      isSuccess={removeMany.isSuccess}
      isError={removeMany.isError}
    />
  )
}

export default GuestBulkDeleteModal
