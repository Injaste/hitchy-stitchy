import { format, parseISO } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  History,
  MessageSquare,
  Phone,
  PhoneCall,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDetailActions,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useAccess } from "../../hooks/useAccess";
import { useInvitationsQuery } from "../../invitation/queries";
import { RSVP_MODE_META } from "../../invitation/rsvpMeta";
import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { STATUS_LABELS } from "../types";

const GuestDetailModal = () => {
  const isDetailOpen = useGuestModalStore((s) => s.isDetailOpen);
  const selectedItem = useGuestModalStore((s) => s.selectedItem);
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const openEdit = useGuestModalStore((s) => s.openEdit);
  const openDelete = useGuestModalStore((s) => s.openDelete);

  const { canUpdate, canDelete } = useAccess();
  // Message-field visibility follows the guest's own invitation page.
  const { data: invitations } = useInvitationsQuery();
  const rsvpFields = (invitations ?? []).find(
    (i) => i.id === selectedItem?.invitation_id,
  )?.rsvp_config.rsvp.fields;

  if (!selectedItem) return null;
  const guest = selectedItem;
  const SourceIcon = RSVP_MODE_META[guest.source].icon;

  const copyPhone = () => {
    if (!guest.phone) return;
    navigator.clipboard.writeText(guest.phone);
    toast.success("Phone copied");
  };

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

  const destructiveActions = [
    canDelete("guests") && { label: "Delete", onClick: openDelete },
  ];
  const primaryAction = canUpdate("guests") && {
    label: "Edit",
    onClick: openEdit,
  };

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{guest.name}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant={statusVariant}>
                {STATUS_LABELS[guest.status]}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <SourceIcon className="size-3" />
                {guest.source === "private" ? "Reserved" : "Public"}
              </Badge>
            </div>

            <div className="space-y-3">
              {guest.phone && (
                <Row icon={<Phone className="w-3 h-3" />} label="Phone">
                  <span className="inline-flex items-center gap-1">
                    <span>{guest.phone}</span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Copy phone number"
                      onClick={copyPhone}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" asChild>
                      <a
                        href={`tel:${guest.phone.replace(/\s+/g, "")}`}
                        aria-label={`Call ${guest.name}`}
                      >
                        <PhoneCall className="size-3.5" />
                      </a>
                    </Button>
                  </span>
                </Row>
              )}
              <Row icon={<Users className="w-3 h-3" />} label="Party size">
                {guest.guest_count}
              </Row>
              {rsvpFields?.message.visible && (
                <Row
                  icon={<MessageSquare className="w-3 h-3" strokeWidth={2.5} />}
                  label="Message"
                >
                  {guest.message ?? "—"}
                </Row>
              )}
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <History className="w-3 h-3 shrink-0" />
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

        <DialogDetailActions
          destructive={destructiveActions}
          primary={primaryAction}
        />
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
