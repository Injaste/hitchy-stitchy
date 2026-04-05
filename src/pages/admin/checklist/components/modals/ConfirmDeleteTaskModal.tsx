import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteTaskMutation } from '../../queries'
import type { Task } from '../../types'

interface ConfirmDeleteTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
}

export function ConfirmDeleteTaskModal({ open, onOpenChange, task }: ConfirmDeleteTaskModalProps) {
  const { mutate: deleteTask, isPending } = useDeleteTaskMutation()

  const handleConfirm = () => {
    if (!task) return
    deleteTask(task.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{task?.title}"?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
