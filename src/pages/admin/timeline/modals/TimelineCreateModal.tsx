import {
  FormDialog,
  FormFooter,
  FormHeader,
} from "@/components/custom/form";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useTimelineMutations } from "../queries";

import TimelineItemForm, { useTimelineItemForm } from "./TimelineItemForm";

const CreateTimelineItemModal = () => {
  const isCreateOpen = useTimelineModalStore((s) => s.isCreateOpen);
  const closeAll = useTimelineModalStore((s) => s.closeAll);
  const isCreateMore = useTimelineModalStore((s) => s.isCreateMore);
  const setIsCreateMore = useTimelineModalStore((s) => s.setIsCreateMore);
  const createPrefill = useTimelineModalStore((s) => s.createPrefill);
  const { eventId } = useAdminStore();
  const { create } = useTimelineMutations();

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
      <FormHeader title="Add schedule item" />

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
