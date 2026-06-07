import { useEffect } from "react";
import { Clock } from "lucide-react";

import {
  FormDialog,
  FormFooter,
  FormHeader,
} from "@/components/custom/form";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useTimelineMutations, useTimelineQuery } from "../queries";
import { getLatestTime } from "../utils";

import TimelineItemForm, { useTimelineItemForm } from "./TimelineItemForm";

const CreateTimelineItemModal = () => {
  const isCreateOpen = useTimelineModalStore((s) => s.isCreateOpen);
  const closeAll = useTimelineModalStore((s) => s.closeAll);
  const isCreateMore = useTimelineModalStore((s) => s.isCreateMore);
  const setIsCreateMore = useTimelineModalStore((s) => s.setIsCreateMore);
  const createPrefill = useTimelineModalStore((s) => s.createPrefill);
  const { eventId } = useAdminStore();
  const { create } = useTimelineMutations();
  const { data: timelineData } = useTimelineQuery();

  const form = useTimelineItemForm({
    defaultValues: {
      day: createPrefill.day ?? "",
      label: createPrefill.label ?? "",
      time_start: createPrefill.time_start ?? undefined,
    },
    onSubmit: (values) => {
      create.mutate({ event_id: eventId!, ...values });
    },
  });

  // In a "create more" run, advance the next item's start so sequential entries
  // chain off each other instead of all snapping back to the original prefill.
  // Two cases: a labelled run (e.g. several "Nikah" items) follows that label's
  // own latest end/start, so it doesn't jump to an unrelated later item elsewhere
  // in the day; with no label we fall back to the day's last item. (The label →
  // day fallback also covers the cache-lag case where the label has no items
  // yet.) FormDialog's own reset is a child effect, so it runs before this parent
  // effect and we win on time_start. Keyed only to the success flip so later
  // timelineData changes (e.g. realtime updates) don't clobber a start the user
  // just edited.
  useEffect(() => {
    if (!isCreateMore || !create.isSuccess || !create.data) return;
    const created = create.data;
    const dayItems =
      timelineData?.days
        .find((d) => d.day === created.day)
        ?.labelGroups.flatMap((g) => g.items) ?? [];
    const sameLabel = created.label
      ? dayItems.filter((i) => i.label === created.label)
      : [];
    const pool = sameLabel.length ? sameLabel : dayItems;
    const latest = getLatestTime([...pool, created]);
    if (latest) form.setFieldValue("time_start", latest);
  }, [create.isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FormDialog
      form={form}
      open={isCreateOpen}
      onOpenChange={closeAll}
      isPending={create.isPending}
      isSuccess={create.isSuccess}
      isError={create.isError}
      closeDelay={isCreateMore ? false : 300}
      resetOnSuccess={isCreateMore}
    >
      <FormHeader icon={<Clock className="size-4" />} title="Add schedule item" />

      <TimelineItemForm />

      <FormFooter
        onCancel={closeAll}
        submitLabel="Add item"
        createMore={{ checked: isCreateMore, onChange: setIsCreateMore }}
      />
    </FormDialog>
  );
};

export default CreateTimelineItemModal;
