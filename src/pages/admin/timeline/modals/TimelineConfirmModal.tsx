import { format, differenceInMinutes } from "date-fns";

import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";

import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useTimelineLifecycleMutations, useActiveTimelineQuery } from "../queries";
import { useAdminStore } from "../../store/useAdminStore";
import { scheduledStartDate, scheduledEndDate } from "../utils";

function formatDuration(totalMinutes: number): string {
  const d = Math.floor(totalMinutes / 1440);
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = totalMinutes % 60;
  return (
    [d > 0 && `${d}d`, h > 0 && `${h}h`, m > 0 && `${m}m`]
      .filter(Boolean)
      .join(" ") || "< 1m"
  );
}

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
            {item.started_at && <span className="font-medium text-foreground">{format(new Date(item.started_at), "h:mm a")}</span>}
            {item.ended_at ? (
              <>, ended <span className="font-medium text-foreground">{format(new Date(item.ended_at), "h:mm a")}</span></>
            ) : " (still active)"}
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
    "confirm-end": {
      titlePrefix: "End",
      titleSuffix: "?",
      action: "End",
      body: <p>This will mark the item as ended.</p>,
    },
  }[reason];

  return (
    <ConfirmAlertModal
      open={isConfirmOpen}
      onOpenChange={closeConfirm}
      variant={confirm.kind === "end" ? "warning" : "success"}
      icon={null}
      title={
        <>
          {config.titlePrefix}{" "}
          <span className="font-medium text-foreground">"{item.title}"</span>
          {" "}{config.titleSuffix}
        </>
      }
      confirmLabel={config.action}
      onConfirm={handleConfirm}
      isPending={mutation.isPending}
      isSuccess={mutation.isSuccess}
      isError={mutation.isError}
    >
      {config.body}
    </ConfirmAlertModal>
  );
};

export default TimelineConfirmModal;
