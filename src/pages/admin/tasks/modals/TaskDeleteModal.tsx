import ConfirmAlertModal from "@/components/custom/confirm-alert-modal"
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess"

import { useTaskModalStore } from "../hooks/useTaskModalStore"
import { useTaskMutations } from "../queries"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"

const TaskDeleteModal = () => {
  const isDeleteOpen = useTaskModalStore((s) => s.isDeleteOpen)
  const selectedItem = useTaskModalStore((s) => s.selectedItem)
  const closeAll = useTaskModalStore((s) => s.closeAll)
  const { eventId } = useAdminStore()
  const { remove } = useTaskMutations()

  useCloseOnSuccess(remove.isSuccess, closeAll)

  if (!selectedItem) return null
  const task = selectedItem

  const handleConfirm = () => {
    remove.mutate({ event_id: eventId!, id: task.id, title: task.title })
  }

  return (
    <ConfirmAlertModal
      open={isDeleteOpen}
      onOpenChange={closeAll}
      variant="destructive"
      title="Delete task"
      description={
        <>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">"{task.title}"</span>?
          This action cannot be undone.
        </>
      }
      confirmLabel="Delete"
      onConfirm={handleConfirm}
      isPending={remove.isPending}
      isSuccess={remove.isSuccess}
      isError={remove.isError}
    />
  )
}

export default TaskDeleteModal
