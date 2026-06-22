import type { FC } from "react";
import { AnimatePresence } from "framer-motion";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

  const dayCount = days?.length ?? 0;

  return (
    <>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Event Dates</CardTitle>
          <CardDescription>
            The days of your celebration — non-consecutive is fine. Each day
            needs a name, and powers the timeline.
          </CardDescription>
          {dayCount > 0 && (
            <CardAction className="text-xs text-muted-foreground">
              {dayCount} {dayCount === 1 ? "day" : "days"}
            </CardAction>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          ) : (
            <ul>
              {/* Short list — rows height-reveal in on mount and on add/remove. */}
              <AnimatePresence>
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
        </CardContent>
      </Card>
      <DayModals />
    </>
  );
};

export default DaysManager;
