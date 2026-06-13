import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";
import { truncate } from "@/lib/utils";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { adminKeys } from "@/pages/admin/lib/queryKeys";

import {
  fetchEventDays,
  fetchDayTimeline,
  fetchDayExpenses,
  fetchDayGifts,
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

// The day's timeline entries — fetched only while the delete modal is open, to
// list what's blocking deletion. The delete_day RPC enforces the same guard.
// staleTime 0 (overriding the 5-min global default): no mutation invalidates
// this key, so it must refetch on each open to reflect items deleted meanwhile.
export function useDayTimelineQuery(date: string, enabled: boolean) {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.dayTimeline(slug!, date),
    queryFn: () => fetchDayTimeline(eventId!, date),
    enabled: enabled && !!eventId && !!slug,
    staleTime: 0,
  });
}

// The day's expenses — fetched only while the delete modal is open, alongside
// items. They attach via the day's budget bucket (a RESTRICT FK), so delete_day
// blocks on them too. RLS keeps this super-admin-only, matching who can delete.
// staleTime 0 (see useDayTimelineQuery): refetch on each open, nothing else
// invalidates this key.
export function useDayExpensesQuery(dayId: string, enabled: boolean) {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.dayExpenses(slug!, dayId),
    queryFn: () => fetchDayExpenses(eventId!, dayId),
    enabled: enabled && !!eventId && !!slug,
    staleTime: 0,
  });
}

// The day's gifts — fetched only while the delete modal is open. They attach via
// event_gifts.day_id (a RESTRICT FK), so delete_day blocks on them too; this
// lists them. Super-admin-only RLS, matching who can delete days. staleTime 0
// (see useDayTimelineQuery): refetch on each open, nothing else invalidates it.
export function useDayGiftsQuery(dayId: string, enabled: boolean) {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.dayGifts(slug!, dayId),
    queryFn: () => fetchDayGifts(eventId!, dayId),
    enabled: enabled && !!eventId && !!slug,
    staleTime: 0,
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
