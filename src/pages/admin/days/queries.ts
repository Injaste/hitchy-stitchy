import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";
import { truncate } from "@/lib/utils";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { adminKeys } from "@/pages/admin/lib/queryKeys";

import {
  fetchEventDays,
  fetchDayItems,
  createDay,
  updateDay,
  deleteDay,
} from "./api";
import type {
  EventDay,
  CreateDayPayload,
  UpdateDayPayload,
  DeleteDayPayload,
} from "./types";

export function useEventDaysQuery() {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.days(slug!),
    queryFn: () => fetchEventDays(eventId!),
    enabled: !!eventId && !!slug,
  });
}

// The day's schedule items — fetched only while the delete modal is open, to
// list what's blocking deletion. The delete_day RPC enforces the same guard.
export function useDayItemsQuery(date: string, enabled: boolean) {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.dayItems(slug!, date),
    queryFn: () => fetchDayItems(eventId!, date),
    enabled: enabled && !!eventId && !!slug,
  });
}

export function useDayMutations() {
  const { slug } = useAdminStore();
  const queryClient = useQueryClient();

  // A day change shifts both the management list and the timeline's day rail /
  // grouping, so refresh both.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.days(slug!) });
    queryClient.invalidateQueries({ queryKey: adminKeys.timeline(slug!) });
  };

  const create = useMutation((payload: CreateDayPayload) => createDay(payload), {
    successMessage: (result: EventDay) => `"${truncate(result.label)}" added`,
    errorMessage: (err) => err.message,
    onSuccess: invalidate,
  });

  const update = useMutation((payload: UpdateDayPayload) => updateDay(payload), {
    successMessage: (result: EventDay) => `Renamed to "${truncate(result.label)}"`,
    errorMessage: (err) => err.message,
    onSuccess: invalidate,
  });

  const remove = useMutation((payload: DeleteDayPayload) => deleteDay(payload), {
    successMessage: () => "Day removed",
    errorMessage: (err) => err.message,
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
