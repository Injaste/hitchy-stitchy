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

import { useTaskModalStore } from "../hooks/useTaskModalStore"
import { useTaskMutations } from "../queries"

const TaskDeleteModal = () => {
  const isDeleteOpen = useTaskModalStore((s) => s.isDeleteOpen)
  const selectedItem = useTaskModalStore((s) => s.selectedItem)
  const closeAll = useTaskModalStore((s) => s.closeAll)
  const { remove } = useTaskMutations()

  if (!selectedItem) return null
  const task = selectedItem

  return (
    <AlertDialog open={isDeleteOpen} onOpenChange={closeAll}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-destructive">
          <AlertDialogTitle className="flex items-center gap-2">
            <TriangleAlert className="w-4 h-4 shrink-0" />
            Delete task
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed text-left">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">"{task.title}"</span>?
            This action cannot be undone.
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
            onClick={() => remove.mutate(task.id)}
            disabled={remove.isPending}
          >
            {remove.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default TaskDeleteModal
