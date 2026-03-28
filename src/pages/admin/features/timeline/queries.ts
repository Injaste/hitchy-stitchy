import { useQuery } from "@/lib/query/useQuery";
import { useMutation } from "@/lib/query/useMutation";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useCueStore } from "@/pages/admin/store/useCueStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import { getDay1Events, getDay2Events, createEvent, updateEvent, deleteEvent } from "./api";
import type { TimelineEvent } from "./types";

export function useDay1Events() {
  return useQuery(getDay1Events, { key: "day1Events" });
}

export function useDay2Events() {
  return useQuery(getDay2Events, { key: "day2Events" });
}

export function useEventMutations() {
  const { day1Events, day2Events, setDay1Events, setDay2Events } = useAdminStore();
  const { activeCueEvent, setActiveCueEvent } = useCueStore();
  const { eventModalDay, closeEventModal, closeConfirmUpdateActiveEvent } = useModalStore();

  const create = useMutation(
    (event: Omit<TimelineEvent, "id">) => createEvent(event),
    {
      successMessage: "Event created",
      errorMessage: "Failed to create event",
      onSuccess: (newEvent) => {
        if (eventModalDay === "day1") {
          setDay1Events([...day1Events, newEvent]);
        } else {
          setDay2Events([...day2Events, newEvent]);
        }
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
        if (eventModalDay === "day1") {
          setDay1Events(day1Events.map((e) => (e.id === updated.id ? updated : e)));
        } else {
          setDay2Events(day2Events.map((e) => (e.id === updated.id ? updated : e)));
        }
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
        setDay1Events(day1Events.filter((e) => e.id !== id));
        setDay2Events(day2Events.filter((e) => e.id !== id));
      },
    }
  );

  return { create, update, remove };
}
