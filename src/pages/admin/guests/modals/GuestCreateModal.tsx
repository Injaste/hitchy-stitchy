import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { useGuestModalStore } from "../hooks/useGuestModalStore"
import { useGuestMutations } from "../queries"
import type { GuestFormValues } from "../types"

import GuestForm from "./GuestForm"

const GuestCreateModal = () => {
  const isCreateOpen = useGuestModalStore((s) => s.isCreateOpen)
  const closeAll = useGuestModalStore((s) => s.closeAll)
  const { eventId } = useAdminStore()
  const { create } = useGuestMutations()

  const handleSubmit = (values: GuestFormValues) => {
    create.mutate({
      event_id: eventId!,
      name: values.name,
      phone: values.phone,
      guest_count: values.guest_count,
      message: values.message,
    })
  }

  return (
    <Dialog open={isCreateOpen} onOpenChange={closeAll}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg">
        <DialogHeader>
          <DialogTitle>Add guest</DialogTitle>
          <DialogDescription>
            Add a new guest to your list. You can update their RSVP status later.
          </DialogDescription>
        </DialogHeader>
        <GuestForm
          onSubmit={handleSubmit}
          onCancel={closeAll}
          isPending={create.isPending}
          submitLabel="Add guest"
        />
      </DialogContent>
    </Dialog>
  )
}

export default GuestCreateModal
