import { useMutation } from "@/lib/query/useMutation";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useCueStore } from "@/pages/admin/store/useCueStore";
import { useTimelineModalStore } from "@/pages/admin/store/useTimelineModalStore";
import { createEvent, updateEvent, deleteEvent } from "./api";
import type { TimelineEvent } from "./types";

export function useEventMutations() {
  const { setEventsForDay } = useAdminStore();
  const { activeCueEvent, setActiveCueEvent } = useCueStore();
  const { eventModalDay, closeEventModal, closeConfirmUpdateActiveEvent } = useTimelineModalStore();

  const create = useMutation(
    (event: Omit<TimelineEvent, "id">) => createEvent(event),
    {
      successMessage: "Event created",
      errorMessage: "Failed to create event",
      onSuccess: (newEvent) => {
        const { events } = useAdminStore.getState();
        setEventsForDay(eventModalDay, [...(events[eventModalDay] ?? []), newEvent]);
        closeEventModal();
      },
    }
  );

  const update = useMutation(
    (event: TimelineEvent) => updateEvent(event),
    {
      successMessage: "Event updated",
      errorMessage: "Failed to update event",
      onSuccess: (updated) => {
        const { events } = useAdminStore.getState();
        setEventsForDay(
          eventModalDay,
          (events[eventModalDay] ?? []).map((e) => (e.id === updated.id ? updated : e))
        );
        if (activeCueEvent?.id === updated.id) setActiveCueEvent(updated);
        closeEventModal();
        closeConfirmUpdateActiveEvent();
      },
    }
  );

  const remove = useMutation(
    (id: string) => deleteEvent(id),
    {
      successMessage: "Event deleted",
      errorMessage: "Failed to delete event",
      onSuccess: (id) => {
        const { events, eventConfig } = useAdminStore.getState();
        for (const day of eventConfig.days) {
          setEventsForDay(day.id, (events[day.id] ?? []).filter((e) => e.id !== id));
        }
      },
    }
  );

  return { create, update, remove };
}
