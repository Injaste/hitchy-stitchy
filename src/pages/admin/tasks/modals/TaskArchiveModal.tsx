import { Archive } from "lucide-react"

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
import { useAdminStore } from "@/pages/admin/store/useAdminStore"

const TaskArchiveModal = () => {
  const isArchiveOpen = useTaskModalStore((s) => s.isArchiveOpen)
  const archiveTargets = useTaskModalStore((s) => s.archiveTargets)
  const closeAll = useTaskModalStore((s) => s.closeAll)
  const { eventId } = useAdminStore()
  const { archive } = useTaskMutations()

  if (archiveTargets.length === 0) return null

  const isSingle = archiveTargets.length === 1
  const first = archiveTargets[0]

  const handleSubmit = () => {
    archive.mutate({
      event_id: eventId!,
      ids: archiveTargets.map((t) => t.id),
      archive: true,
      label: first.title,
    })
  }

  return (
    <AlertDialog open={isArchiveOpen} onOpenChange={closeAll}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-destructive">
          <AlertDialogTitle className="flex items-center gap-2">
            <Archive className="w-4 h-4 shrink-0" />
            {isSingle ? "Archive task" : `Archive ${archiveTargets.length} tasks`}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed text-left">
            {isSingle ? (
              <>
                Are you sure you want to archive{" "}
                <span className="font-semibold text-foreground">"{first.title}"</span>?
                It will be hidden from the list and accessible from the archived view.
              </>
            ) : (
              <>
                Are you sure you want to archive{" "}
                <span className="font-semibold text-foreground">
                  {archiveTargets.length} completed tasks
                </span>
                ? They will be hidden from the list and accessible from the archived view.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            variant="outline"
            size="sm"
            onClick={closeAll}
            disabled={archive.isPending}
            autoFocus
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="sm"
            onClick={handleSubmit}
            disabled={archive.isPending}
          >
            {archive.isPending ? "Archiving…" : "Archive"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default TaskArchiveModal
