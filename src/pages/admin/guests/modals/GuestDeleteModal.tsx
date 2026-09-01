import ConfirmAlertModal from "@/components/custom/confirm-alert-modal"
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess"

import { useGuestModalStore } from "../hooks/useGuestModalStore"
import { useGuestMutations } from "../queries"

// Serves both single delete (row kebab / detail) and bulk delete (selection
// bar) — one RPC, one confirm dialog. Bulk delete stays confirm-gated, unlike
// bulk status which is undo, but type-to-confirm only kicks in for a genuine
// multi-row delete — a 1-row bulk selection reads and behaves like a single
// row delete, per destructive-actions.md ("never single rows").
const GuestDeleteModal = () => {
  const isDeleteOpen = useGuestModalStore((s) => s.isDeleteOpen)
  const selectedItem = useGuestModalStore((s) => s.selectedItem)
  const deleteIds = useGuestModalStore((s) => s.deleteIds)
  const closeAll = useGuestModalStore((s) => s.closeAll)
  const selectedIds = useGuestModalStore((s) => s.selectedIds)
  const setSelectedIds = useGuestModalStore((s) => s.setSelectedIds)
  const { remove } = useGuestMutations()

  const ids = deleteIds.length ? deleteIds : selectedItem ? [selectedItem.id] : []

  // Both paths name their target from selectedItem — a store snapshot that
  // outlives the row itself. Never look this up in the guests list: the delete
  // removes that row while this dialog is still on screen. Undefined for a bulk
  // delete, and also for a single one whose row realtime dropped before the
  // opener could snapshot it — so the copy below asks "do we have a name?",
  // never "is this one row?".
  const name =
    ids.length === 1 && selectedItem?.id === ids[0] ? selectedItem.name : undefined

  // Prune the deleted ids from the selection so the bulk bar's count doesn't
  // linger with phantom rows — covers both the single and bulk paths.
  useCloseOnSuccess(remove.isSuccess, () => {
    if (ids.length > 0) {
      const next = new Set(selectedIds)
      ids.forEach((id) => next.delete(id))
      setSelectedIds(next)
    }
    closeAll()
  })

  if (ids.length === 0) return null

  const handleConfirm = () => {
    remove.mutate({ ids, name })
  }

  return (
    <ConfirmAlertModal
      open={isDeleteOpen}
      onOpenChange={closeAll}
      variant="destructive"
      title={ids.length === 1 ? "Remove guest" : `Remove ${ids.length} guests`}
      description={
        name ? (
          <>
            Are you sure you want to remove{" "}
            <span className="font-semibold text-foreground">"{name}"</span>{" "}
            from your guest list? This action cannot be undone.
          </>
        ) : (
          "This removes their RSVP details entirely. This action cannot be undone."
        )
      }
      confirmPhrase={ids.length > 1 ? `remove ${ids.length} guests` : undefined}
      confirmLabel="Remove"
      onConfirm={handleConfirm}
      isPending={remove.isPending}
      isSuccess={remove.isSuccess}
      isError={remove.isError}
    />
  )
}

export default GuestDeleteModal
