import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteRoleMutation } from '../../queries'
import type { Role } from '../../types'

interface ConfirmDeleteRoleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
}

export function ConfirmDeleteRoleModal({ open, onOpenChange, role }: ConfirmDeleteRoleModalProps) {
  const { mutate: deleteRole, isPending } = useDeleteRoleMutation()

  const handleConfirm = () => {
    if (!role) return
    deleteRole(role.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Role</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the "{role?.name}" role?
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
