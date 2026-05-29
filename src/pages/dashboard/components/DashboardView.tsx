import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Container from "@/components/custom/container";
import ComponentFade from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/states/error-state";

import { itemFadeUp } from "@/lib/animations";

import { useCountEventsQuery, useEventsQuery } from "../queries";
import type { EventsCount } from "../types";

import DashboardTopbar from "./DashboardTopbar";
import DashboardHeader from "./DashboardHeader";
import DashboardStats from "./DashboardStats";
import CreateEventView from "../create-event";

import EventEmpty from "../states/EventEmpty";
import DashboardSkeleton from "../states/DashboardSkeleton";
import EventCard from "./EventCard";
import EventCreate from "./EventCreate";

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
          <DashboardSkeleton />
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
      <ComponentFade key="content">
        <DashboardStats eventsCount={eventsCount} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          <AnimatePresence>
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                custom={i}
                variants={itemFadeUp}
                initial="hidden"
                animate="show"
                exit="hidden"
                layout
                transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
            <motion.div
              key="create"
              custom={events.length}
              variants={itemFadeUp}
              initial="hidden"
              animate="show"
              exit="hidden"
              layout
              transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
            >
              <EventCreate onCreateEvent={() => setIsCreateOpen(true)} />
            </motion.div>
          </AnimatePresence>
        </div>
      </ComponentFade>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardTopbar />

      <DashboardHeader
        isLoading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        onCreateEvent={() => setIsCreateOpen(true)}
      />

      <div className="px-4 md:px-6">
        <Container pageSpacing>
          <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>
        </Container>
      </div>

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
