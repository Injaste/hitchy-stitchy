import { format } from "date-fns"
import { Phone, Users, StickyNote } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { useAccess } from "../../hooks/useAccess"
import { useGuestModalStore } from "../hooks/useGuestModalStore"
import { STATUS_LABELS, SOURCE_LABELS } from "../types"

const GuestDetailModal = () => {
  const isDetailOpen = useGuestModalStore((s) => s.isDetailOpen)
  const selectedItem = useGuestModalStore((s) => s.selectedItem)
  const closeAll = useGuestModalStore((s) => s.closeAll)
  const openEdit = useGuestModalStore((s) => s.openEdit)
  const openDelete = useGuestModalStore((s) => s.openDelete)

  const { canUpdate, canDelete } = useAccess()

  if (!selectedItem) return null
  const guest = selectedItem

  const statusVariant =
    guest.status === "confirmed"
      ? "default"
      : guest.status === "cancelled"
        ? "destructive"
        : "secondary"

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent className="w-[95vw] max-w-lg" aria-describedby="">
        <DialogHeader>
          <DialogTitle>{guest.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant={statusVariant}>{STATUS_LABELS[guest.status]}</Badge>
            <Badge variant="outline" className="text-muted-foreground">
              {SOURCE_LABELS[guest.source]}
            </Badge>
          </div>

          <div className="space-y-3">
            <Row icon={<Phone className="w-3 h-3" />} label="Phone">
              {guest.phone}
            </Row>
            <Row icon={<Users className="w-3 h-3" />} label="Party size">
              {guest.guest_count}
            </Row>
            {guest.message && (
              <Row icon={<StickyNote className="w-3 h-3" />} label="Message">
                {guest.message}
              </Row>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Added {format(new Date(guest.created_at), "d MMM yyyy")}
            </p>
            <div className="flex gap-2">
              {canDelete("rsvp") && (
                <Button variant="destructive" size="sm" onClick={openDelete}>
                  Delete
                </Button>
              )}
              {canUpdate("rsvp") && (
                <Button size="sm" onClick={openEdit} autoFocus>
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface RowProps {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}

const Row = ({ icon, label, children }: RowProps) => (
  <div className="flex items-start gap-3 text-sm">
    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground w-28 shrink-0 pt-0.5">
      {icon}
      {label}
    </span>
    <span className="text-foreground">{children}</span>
  </div>
)

export default GuestDetailModal
