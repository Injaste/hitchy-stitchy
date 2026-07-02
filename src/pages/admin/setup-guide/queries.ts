import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";
import { useAdminStore } from "../store/useAdminStore";
import { adminKeys } from "../lib/queryKeys";
import {
  getTutorialState,
  setTutorialState,
  fetchSetupCounts,
  type TutorialState,
} from "./api";

/** Reads the event's setup-guide state. Super-admin only. */
export function useTutorialStateQuery() {
  const { slug, eventId, isSuperAdmin } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.tutorial(slug, eventId),
    queryFn: () => getTutorialState(eventId),
    enabled: !!slug && !!eventId && isSuperAdmin,
  });
}

/** Feature counts for checklist completion. Super-admin only. */
export function useSetupCountsQuery() {
  const { slug, eventId, isSuperAdmin } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.setupCounts(slug, eventId),
    queryFn: () => fetchSetupCounts(eventId),
    enabled: !!slug && !!eventId && isSuperAdmin,
  });
}

/** Keep setup-counts retroactive: when any watched feature's list query updates (a
 *  guest added, a timeline item created, …) invalidate the counts so the matching
 *  step ticks live — without wiring every feature's mutation into the guide. The
 *  counts key isn't watched, so its own refetch can't loop. Super-admin only. */
export function useSetupCountsSync() {
  const { slug, eventId, isSuperAdmin } = useAdminStore();
  const qc = useQueryClient();
  useEffect(() => {
    if (!slug || !eventId || !isSuperAdmin) return;
    const watched = ["guests", "timeline", "tasks", "budget", "gifts", "invitation"];
    return qc.getQueryCache().subscribe((event) => {
      if (event.type !== "updated") return;
      const key = event.query.queryKey as unknown[];
      if (key[0] === slug && watched.includes(key[1] as string)) {
        qc.invalidateQueries({ queryKey: adminKeys.setupCounts(slug, eventId) });
      }
    });
  }, [slug, eventId, isSuperAdmin, qc]);
}

/** Write the event's full guide state (dismissal + viewed steps). Optimistic, and
 *  we KEEP the optimistic value on error: a low-stakes per-event flag, so not
 *  reverting lets dismiss / show-again / mark-viewed work in-session even before the
 *  table migration is applied (the next successful fetch reconciles). */
export function useSetTutorialStateMutation() {
  const { slug, eventId } = useAdminStore();
  const qc = useQueryClient();
  const key = adminKeys.tutorial(slug, eventId);

  return useMutation<TutorialState, TutorialState>(
    (state) => setTutorialState(eventId, state),
    {
      silent: true,
      onMutate: async (state) => {
        await qc.cancelQueries({ queryKey: key });
        qc.setQueryData<TutorialState>(key, state);
      },
      // No onSuccess re-stamp: setTutorialState echoes its input (no server-computed
      // fields), so onMutate already cached the authoritative value. Re-writing that
      // per-call snapshot on success would clobber a sibling mutation that changed a
      // DIFFERENT field in between — e.g. show-again (dismissedBy) and the completion
      // confetti (celebratedBy) fire together; the stale re-stamp briefly reverted
      // `celebrated` and double-fired the burst. A later fetch reconciles with the DB.
    },
  );
}
