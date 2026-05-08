import { AnimatePresence, motion } from "framer-motion";

import Container from "@/components/custom/container";
import { ComponentFade } from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/states/error-state";

import { container, itemFadeIn, itemFadeUp } from "@/lib/animations";

import { useCountEventsQuery, useEventsQuery } from "../queries";
import type { EventsCount } from "../types";

import DashboardTopbar from "./DashboardTopbar";
import DashboardHeader from "./DashboardHeader";

import EventEmpty from "../states/EventEmpty";
import EventSkeleton from "../states/EventSkeleton";
import EventView from "../components/EventView";

const EMPTY_COUNT: EventsCount = { active: 0, upcoming: 0, pending: 0 };

const DashboardView = () => {
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
          <EventEmpty />
        </ComponentFade>
      );

    return (
      <ComponentFade key="events">
        <EventView events={events} />
      </ComponentFade>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={itemFadeIn}>
          <DashboardTopbar />
        </motion.div>

        <Container>
          <div className="px-6 md:px-10 pt-8 pb-22 md:py-12 space-y-8">
            <motion.div variants={itemFadeUp}>
              <DashboardHeader
                eventsCount={eventsCount}
                isLoading={isLoading}
                isFetching={isFetching}
                refetch={refetch}
              />
            </motion.div>

            <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>
          </div>
        </Container>
      </motion.div>
    </div>
  );
};

export default DashboardView;

// TODOS
/*
  implement a way to display ur user name that is project based on and event based.. 
  implement project settings, can handle invites all etc...
  implement...
*/
