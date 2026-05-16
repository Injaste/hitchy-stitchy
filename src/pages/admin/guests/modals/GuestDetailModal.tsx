import { format, parseISO } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Phone,
  StickyNote,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useAccess } from "../../hooks/useAccess";
import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { STATUS_LABELS } from "../types";

const GuestDetailModal = () => {
  const isDetailOpen = useGuestModalStore((s) => s.isDetailOpen);
  const selectedItem = useGuestModalStore((s) => s.selectedItem);
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const openEdit = useGuestModalStore((s) => s.openEdit);
  const openDelete = useGuestModalStore((s) => s.openDelete);

  const { canUpdate, canDelete } = useAccess();

  if (!selectedItem) return null;
  const guest = selectedItem;

  const statusVariant =
    guest.status === "confirmed"
      ? "default"
      : guest.status === "cancelled"
        ? "destructive"
        : "secondary";

  const formatDate = "d MMM yyyy";
  const formatTime = "HH:mm";

  const historyItems = [
    {
      label: guest.source === "public" ? "RSVP-ed" : "Invited",
      icon: UserPlus,
      date: format(parseISO(guest.created_at), formatDate),
      time: format(parseISO(guest.created_at), formatTime),
    },
    guest.confirmed_at && {
      label: "Confirmed",
      icon: CheckCircle2,
      date: format(parseISO(guest.confirmed_at), formatDate),
      time: format(parseISO(guest.confirmed_at), formatTime),
    },
    guest.cancelled_at && {
      label: "Cancelled",
      icon: XCircle,
      date: format(parseISO(guest.cancelled_at), formatDate),
      time: format(parseISO(guest.cancelled_at), formatTime),
    },
  ].filter(Boolean) as {
    label: string;
    icon: React.ElementType;
    date: string;
    time: string;
  }[];

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{guest.name}</DialogTitle>
          <DialogDescription>Guest RSVP details.</DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant={statusVariant}>
                {STATUS_LABELS[guest.status]}
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

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                History
              </p>
              <div className="space-y-1">
                {historyItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between text-xs text-muted-foreground"
                    >
                      <span className="flex items-center gap-1.5">
                        <Icon className="size-3" />
                        {item.label}
                      </span>
                      <span className="flex gap-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {item.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {item.time}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogBody>

        <Separator />

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface RowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

const Row = ({ icon, label, children }: RowProps) => (
  <div className="flex items-start gap-3 text-sm">
    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground w-28 shrink-0 pt-0.5">
      {icon}
      {label}
    </span>
    <span className="text-foreground">{children}</span>
  </div>
);

export default GuestDetailModal;
