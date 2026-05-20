import { CheckCircle, Clock, XCircle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestMutations } from "../queries";
import { STATUS_LABELS, type GuestStatus } from "../types";

const STATUS_META: Record<
  GuestStatus,
  {
    icon: typeof CheckCircle;
    variant: "success" | "warning" | "destructive";
    headerClass: string;
    actionLabel: string;
    pendingLabel: string;
  }
> = {
  confirmed: {
    icon: CheckCircle,
    variant: "success",
    headerClass: "text-success",
    actionLabel: "Confirm",
    pendingLabel: "Confirming…",
  },
  pending: {
    icon: Clock,
    variant: "warning",
    headerClass: "text-warning",
    actionLabel: "Set pending",
    pendingLabel: "Updating…",
  },
  cancelled: {
    icon: XCircle,
    variant: "destructive",
    headerClass: "text-destructive",
    actionLabel: "Cancel guests",
    pendingLabel: "Cancelling…",
  },
};

const GuestBulkStatusModal = () => {
  const isOpen = useGuestModalStore((s) => s.isBulkUpdateOpen);
  const ids = useGuestModalStore((s) => s.bulkUpdateIds);
  const status = useGuestModalStore((s) => s.bulkUpdateStatus);
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const { bulkUpdateGuests } = useGuestMutations();

  if (!status) return null;

  const meta = STATUS_META[status];
  const Icon = meta.icon;
  const targetLabel = STATUS_LABELS[status].toLowerCase();
  const guestNoun = ids.length === 1 ? "guest" : "guests";

  const handleConfirm = () => bulkUpdateGuests.mutate({ ids, status });

  return (
    <AlertDialog open={isOpen} onOpenChange={(v) => !v && closeAll()}>
      <AlertDialogContent>
        <AlertDialogHeader className={meta.headerClass}>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon className="w-4 h-4 shrink-0" />
            Update {ids.length} {guestNoun}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Mark{" "}
            <span className="font-semibold text-foreground">
              {ids.length} {guestNoun}
            </span>{" "}
            as{" "}
            <span className="font-semibold text-foreground">{targetLabel}</span>
            ? You can change this for individual guests later.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            variant="outline"
            size="sm"
            onClick={closeAll}
            disabled={bulkUpdateGuests.isPending}
            autoFocus
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant={meta.variant}
            size="sm"
            onClick={handleConfirm}
            disabled={bulkUpdateGuests.isPending}
          >
            {bulkUpdateGuests.isPending ? meta.pendingLabel : meta.actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GuestBulkStatusModal;
