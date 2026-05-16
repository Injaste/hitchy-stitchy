import { useTaskModalStore } from "../hooks/useTaskModalStore"

import TaskCreateModal from "./TaskCreateModal"
import TaskDetailModal from "./TaskDetailModal"
import TaskEditModal from "./TaskEditModal"
import TaskDeleteModal from "./TaskDeleteModal"
import TaskArchiveModal from "./TaskArchiveModal"
import TaskArchivedSheet from "../components/TaskArchivedSheet"

const TaskModals = () => {
  // Key the form-bearing edit modal by selectedItem.id so useForm
  // re-initialises with fresh defaults when a different task is selected.
  const selectedId = useTaskModalStore((s) => s.selectedItem?.id)

  return (
    <>
      <TaskCreateModal />
      <TaskDetailModal />
      <TaskEditModal key={selectedId ?? "none"} />
      <TaskDeleteModal />
      <TaskArchiveModal />
      <TaskArchivedSheet />
    </>
  )
}

export default TaskModals
