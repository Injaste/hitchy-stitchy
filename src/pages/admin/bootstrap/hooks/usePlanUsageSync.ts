import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminStore } from "../../store/useAdminStore";
import { adminKeys } from "../../lib/queryKeys";

/** Feature caches whose row counts feed plan.usage (days/guests/members/pages/
 *  timeline_items). Their query keys are exactly [slug, <name>]; the invitation
 *  list backs the "pages" count and the timeline list backs "timeline_items". A
 *  change to any means the bootstrap usage snapshot is stale. */
const METERED_QUERY_NAMES = new Set([
  "days",
  "members",
  "guests",
  "invitation",
  "timeline",
  "tasks",
]);

/**
 * Keeps plan.usage — and therefore the limit-reached banner — reactive.
 *
 * get_bootstrap_context returns usage as a one-time snapshot, so adding or
 * removing a day, guest, member, or invitation page would otherwise leave the
 * banner stale until the next focus/navigation refetch. We watch the metered
 * feature caches and re-pull the bootstrap whenever one changes, keeping the
 * server the source of truth for the counts (incl. the active/cancelled guest
 * rule we don't replicate on the client).
 *
 * Centralised on purpose: the mutations that change these counts are scattered
 * and mix optimistic patches with invalidation, so a single cache listener is
 * far more reliable than wiring a bootstrap-invalidate into each onSuccess.
 * Mounted once in the bootstrap layer.
 */
export function usePlanUsageSync() {
  const slug = useAdminStore((s) => s.slug);
  const qc = useQueryClient();

  useEffect(() => {
    if (!slug) return;

    return qc.getQueryCache().subscribe((event) => {
      if (event.type !== "updated") return;
      // Only real data changes — a resolved fetch or an optimistic write —
      // not fetch-start / invalidate / error transitions.
      if (event.action.type !== "success" && event.action.type !== "setState") {
        return;
      }

      // Match exactly [slug, <metered>]; length 2 excludes deeper keys like the
      // per-day timeline ([slug, 'days', date, 'timeline']).
      const key = event.query.queryKey;
      if (
        key.length === 2 &&
        key[0] === slug &&
        METERED_QUERY_NAMES.has(key[1] as string)
      ) {
        qc.invalidateQueries({ queryKey: adminKeys.bootstrap(slug) });
      }
    });
  }, [slug, qc]);
}
