import { format, differenceInMinutes } from "date-fns";

function formatDuration(totalMinutes: number): string {
  const d = Math.floor(totalMinutes / 1440);
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = totalMinutes % 60;
  return [
    d > 0 && `${d}d`,
    h > 0 && `${h}h`,
    m > 0 && `${m}m`,
  ]
    .filter(Boolean)
    .join(" ") || "< 1m";
}

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SubmitButton from "@/components/custom/form/SubmitButton";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";

import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useTimelineLifecycleMutations, useActiveTimelineQuery } from "../queries";
import { useAdminStore } from "../../store/useAdminStore";
import { scheduledStartDate, scheduledEndDate } from "../utils";

const WillEndNote = ({ title }: { title: string }) => (
  <p>
    <span className="font-medium text-foreground">"{title}"</span> is currently
    live and will be ended.
  </p>
);

const TimelineConfirmModal = () => {
  const isConfirmOpen = useTimelineModalStore((s) => s.isConfirmOpen);
  const confirm = useTimelineModalStore((s) => s.confirm);
  const closeConfirm = useTimelineModalStore((s) => s.closeConfirm);

  const { eventId } = useAdminStore();
  const { data: active } = useActiveTimelineQuery();
  const { start, end } = useTimelineLifecycleMutations();

  const mutation = confirm?.kind === "end" ? end : start;
  useCloseOnSuccess(mutation.isSuccess, closeConfirm);

  if (!confirm) return null;
  const { item, reason } = confirm;

  const otherActive = active && active.id !== item.id ? active : null;

  const handleConfirm = () => {
    mutation.mutate({ event_id: eventId!, id: item.id });
  };

  const config = {
    restart: {
      titlePrefix: "Restart",
      titleSuffix: "?",
      action: "Restart",
      body: (
        <>
          <p>
            This will reset the start time to now. Previous run: started{" "}
            {item.started_at && format(new Date(item.started_at), "h:mm a")}
            {item.ended_at
              ? `, ended ${format(new Date(item.ended_at), "h:mm a")}`
              : " (still active)"}
            .
          </p>
          {otherActive && <WillEndNote title={otherActive.title} />}
        </>
      ),
    },
    "early-start": {
      titlePrefix: "Start",
      titleSuffix: "early?",
      action: "Start now",
      body: (
        <>
          <p>
            This is{" "}
            <span className="font-medium text-foreground">
              {formatDuration(differenceInMinutes(scheduledStartDate(item), new Date()))}
            </span>{" "}
            before the scheduled{" "}
            <span className="font-medium text-foreground">
              {format(scheduledStartDate(item), "h:mm a")}
            </span>{" "}
            start.
          </p>
          {otherActive && <WillEndNote title={otherActive.title} />}
        </>
      ),
    },
    "early-end": {
      titlePrefix: "End",
      titleSuffix: "early?",
      action: "End now",
      body: (() => {
        const endDate = scheduledEndDate(item);
        return (
          <p>
            This is{" "}
            {endDate && (
              <span className="font-medium text-foreground">
                {formatDuration(differenceInMinutes(endDate, new Date()))}
              </span>
            )}{" "}
            before the scheduled{" "}
            {endDate && (
              <span className="font-medium text-foreground">
                {format(endDate, "h:mm a")}
              </span>
            )}{" "}
            end.
          </p>
        );
      })(),
    },
    "will-end": {
      titlePrefix: "Start",
      titleSuffix: "?",
      action: "Start",
      body: otherActive ? <WillEndNote title={otherActive.title} /> : null,
    },
  }[reason];

  return (
    <AlertDialog open={isConfirmOpen} onOpenChange={closeConfirm}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {config.titlePrefix}{" "}
            <span className="font-medium text-foreground">"{item.title}"</span>
            {" "}{config.titleSuffix}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-1.5 text-left">
              {config.body}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            variant="outline"
            size="sm"
            onClick={closeConfirm}
            disabled={mutation.isPending}
          >
            Cancel
          </AlertDialogCancel>
          <SubmitButton
            type="button"
            size="sm"
            onClick={handleConfirm}
            isPending={mutation.isPending}
            isSuccess={mutation.isSuccess}
            isError={mutation.isError}
          >
            {config.action}
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TimelineConfirmModal;
