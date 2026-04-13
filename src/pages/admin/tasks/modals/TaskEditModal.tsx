import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useTaskModalStore } from "../hooks/useTaskModalStore"
import { useTaskMutations } from "../queries"
import type { TaskFormValues } from "../types"

import TaskForm from "./TaskForm"

const TaskEditModal = () => {
  const isEditOpen = useTaskModalStore((s) => s.isEditOpen)
  const selectedItem = useTaskModalStore((s) => s.selectedItem)
  const closeAll = useTaskModalStore((s) => s.closeAll)
  const { update } = useTaskMutations()

  if (!selectedItem) return null
  const task = selectedItem

  const handleSubmit = (values: TaskFormValues) => {
    update.mutate({
      id: task.id,
      title: values.title,
      description: values.description,
      priority: values.priority,
      due_at: values.due_at,
    })
  }

  return (
    <Dialog open={isEditOpen} onOpenChange={closeAll}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>Update the task details.</DialogDescription>
        </DialogHeader>
        <TaskForm
          defaultValues={{
            title: task.title,
            description: task.description ?? "",
            priority: task.priority,
            due_at: task.due_at,
          }}
          onSubmit={handleSubmit}
          onCancel={closeAll}
          isPending={update.isPending}
          submitLabel="Save changes"
        />
      </DialogContent>
    </Dialog>
  )
}

export default TaskEditModal
