import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Container from "@/components/custom/container";
import ComponentFade from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/states/error-state";

import { container, itemFadeIn } from "@/lib/animations";

import { useCountEventsQuery, useEventsQuery } from "../queries";
import type { EventsCount } from "../types";

import DashboardTopbar from "./DashboardTopbar";
import DashboardHeader from "./DashboardHeader";
import CreateEventView from "../create-event";

import EventEmpty from "../states/EventEmpty";
import EventSkeleton from "../states/EventSkeleton";
import EventView from "../components/EventView";

const EMPTY_COUNT: EventsCount = { active: 0, upcoming: 0, pending: 0 };

const DashboardView = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    data: events,
    isLoading,
    isFetching,
    isError,
    isRefetching,
    refetch,
  } = useEventsQuery();
  const { data: eventsCount = EMPTY_COUNT } = useCountEventsQuery();

  const renderBody = () => {
    if (isLoading)
      return (
        <ComponentFade key="skeleton">
          <EventSkeleton />
        </ComponentFade>
      );

    if (isError)
      return (
        <ComponentFade key="error">
          <ErrorState
            message="We couldn't load your events. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      );

    if (!events?.length)
      return (
        <ComponentFade key="empty">
          <EventEmpty onCreateEvent={() => setIsCreateOpen(true)} />
        </ComponentFade>
      );

    return (
      <ComponentFade key="events">
        <EventView
          events={events}
          onCreateEvent={() => setIsCreateOpen(true)}
        />
      </ComponentFade>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={itemFadeIn}>
          <DashboardTopbar />
        </motion.div>

        <DashboardHeader
          eventsCount={eventsCount}
          isLoading={isLoading}
          isFetching={isFetching}
          refetch={refetch}
          onCreateEvent={() => setIsCreateOpen(true)}
        />

        <Container>
          <div className="px-4 md:px-6 pt-4 pb-22 md:pt-6 md:pb-12 space-y-8">
            <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>
          </div>
        </Container>
      </motion.div>

      <AnimatePresence>
        {isCreateOpen && (
          <ComponentFade
            key="create-overlay"
            className="fixed inset-0 z-50 bg-background overflow-y-auto"
          >
            <CreateEventView onClose={() => setIsCreateOpen(false)} />
          </ComponentFade>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardView;
