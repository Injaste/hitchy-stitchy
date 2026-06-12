import type { FC } from "react";
import { AnimatePresence } from "framer-motion";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useAccess } from "../../hooks/useAccess";
import { useEventDaysQuery } from "../queries";

import DayRow from "./DayRow";
import AddDay from "./AddDay";

const DaysManager: FC = () => {
  const { canEdit } = useAccess();
  const { data: days, isLoading } = useEventDaysQuery();
  const canManage = canEdit("timeline");

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-base">Event Dates</CardTitle>
        <CardDescription>
          The days of your celebration — non-consecutive is fine. Each day needs
          a name, and powers the timeline.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        ) : (
          <ul>
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
      </CardContent>
    </Card>
  );
};

export default DaysManager;
