import { useState } from "react";
import { FormShellContext } from "@/components/custom/form/form-context";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { type Invitation } from "../../types";
import { useInvitationMutation } from "../../queries";
import ConfigsForm, { useConfigsForm } from "./ConfigsForm";

const pad = (n: number) => String(n).padStart(2, "0");

const combineDeadline = (
  date: string | null,
  time: string | null,
): string | null => {
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = (time ?? "23:59").split(":").map(Number);
  if ([y, m, d, h, min].some(Number.isNaN)) return null;
  const local = new Date(y, m - 1, d, h, min);
  return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())} ${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`;
};

interface ConfigsViewProps {
  invitation: Invitation;
}

const ConfigsView = ({ invitation }: ConfigsViewProps) => {
  const { eventId } = useAdminStore();
  const { update } = useInvitationMutation();
  const [attemptCount, setAttemptCount] = useState(0);

  const form = useConfigsForm({
    invitation,
    onSubmit: (v) => {
      update.mutate({
        event_id: eventId!,
        event_date: v.event_date,
        event_time_start: v.event_time_start,
        event_time_end: v.event_time_end,
        rsvp_mode: v.rsvp_mode,
        rsvp_deadline: combineDeadline(
          v.rsvp_deadline_date,
          v.rsvp_deadline_time,
        ),
        max_guests: v.max_guests,
        guest_count_min: v.guest_count_min,
        guest_count_max: v.guest_count_max,
        confirmation_message: v.confirmation_message,
        config: {
          rsvp: {
            fields: {
              message: {
                visible: v.message_visible,
                required: v.message_visible ? v.message_required : false,
              },
            },
          },
        },
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAttemptCount((c) => c + 1);
    form.handleSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setAttemptCount((c) => c + 1);
      form.handleSubmit();
    }
  };

  return (
    <FormShellContext.Provider
      value={{
        attemptCount,
        form,
        isPending: update.isPending,
        isSuccess: update.isSuccess,
        isError: update.isError,
      }}
    >
      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="max-w-2xl space-y-4"
      >
        <ConfigsForm />
      </form>
    </FormShellContext.Provider>
  );
};

export default ConfigsView;
