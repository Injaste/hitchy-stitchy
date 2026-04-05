import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ComponentFade } from "@/components/animations/animate-component-fade";
import { Skeleton } from "@/components/ui/skeleton";

import { useAdminStore } from "../store/useAdminStore";
import { useCueStore } from "../store/useCueStore";
import { useTimelineQuery } from "./queries";
import type { TimelineEvent } from "./types";

import { TimelineDayTabs } from "./components/TimelineDayTabs";
import { TimelineList } from "./components/TimelineList";
import { TimelineEventModal } from "./components/modals/TimelineEventModal";
import { ConfirmStartCueModal } from "./components/modals/ConfirmStartCueModal";
import { ConfirmDeleteTimelineModal } from "./components/modals/ConfirmDeleteTimelineModal";
import { ConfirmUpdateActiveCueModal } from "./components/modals/ConfirmUpdateActiveCueModal";

const Timeline = () => {
  const { days } = useAdminStore();
  const { activeCue } = useCueStore();
  const { data: allEvents, isLoading } = useTimelineQuery();

  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  useEffect(() => {
    if (!days.length) return;
    const today = new Date().toISOString().slice(0, 10);
    const match = days.find((d) => d.date === today);
    setSelectedDayId(match?.id ?? days[0].id);
  }, [days]);

  const dayEvents = (allEvents ?? []).filter((e) => e.dayId === selectedDayId);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [startCueModalOpen, setStartCueModalOpen] = useState(false);
  const [cueTarget, setCueTarget] = useState<TimelineEvent | null>(null);
  const [updateCueModalOpen, setUpdateCueModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TimelineEvent | null>(null);

  const handleEdit = (event: TimelineEvent) => {
    setEditingEvent(event);
    setEditModalOpen(true);
  };

  const handleStartCue = (event: TimelineEvent) => {
    setCueTarget(event);
    if (activeCue) {
      setUpdateCueModalOpen(true);
    } else {
      setStartCueModalOpen(true);
    }
  };

  return (
    <>
      <TimelineDayTabs
        activeDayId={selectedDayId ?? ""}
        onSelectDay={setSelectedDayId}
      />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <ComponentFade key="skeleton">
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          </ComponentFade>
        ) : (
          <ComponentFade key="content">
            <TimelineList
              events={dayEvents}
              onEdit={handleEdit}
              onStartCue={handleStartCue}
            />
          </ComponentFade>
        )}
      </AnimatePresence>

      <TimelineEventModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        event={editingEvent}
        dayId={selectedDayId ?? ""}
      />
      <ConfirmStartCueModal
        open={startCueModalOpen}
        onOpenChange={setStartCueModalOpen}
        event={cueTarget}
      />
      <ConfirmUpdateActiveCueModal
        open={updateCueModalOpen}
        onOpenChange={setUpdateCueModalOpen}
        event={cueTarget}
      />
      <ConfirmDeleteTimelineModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        event={deleteTarget}
      />
    </>
  );
};

export default Timeline;
