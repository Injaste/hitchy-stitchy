import type { FC } from "react";
import { AnimatePresence } from "framer-motion";

import { Skeleton } from "@/components/ui/skeleton";

import { useAccess } from "../../hooks/useAccess";
import { useEventDaysQuery } from "../queries";

import DayModals from "../modals";
import DayRow from "./DayRow";
import AddDay from "./AddDay";

const DaysManager: FC = () => {
  const { isSuperAdmin } = useAccess();
  const { data: days, isLoading } = useEventDaysQuery();
  // Days are the event's structural spine — owner-only. The day RPCs enforce the
  // same via is_super_admin_member; this gate is just the matching UX (everyone
  // else sees the dates read-only, as they already do on the timeline).
  const canManage = isSuperAdmin;

  // Flush (no card) — matches the other Event settings sections. The rail tab
  // already labels this "Event Dates", so just the description + list here.
  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          The days of your celebration — non-consecutive is fine. Each day needs
          a name, and powers the timeline.
        </p>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        ) : (
          <ul>
            {/* Short list — rows height-reveal in on mount and on add/remove. */}
            <AnimatePresence initial={false}>
              {(days ?? []).map((day) => (
                <DayRow
                  key={day.id}
                  day={day}
                  canManage={canManage}
                  canRemove={(days?.length ?? 0) > 1}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}

        {canManage && <AddDay />}
      </div>
      <DayModals />
    </>
  );
};

export default DaysManager;
