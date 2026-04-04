import { AnimatePresence, motion } from "framer-motion";

import Container from "@/components/custom/container";
import { ComponentFade } from "@/components/animations/animate-component-fade";

import { container } from "@/lib/animations";

import { useCountEventsQuery, useEventsQuery } from "../queries";
import type { EventsCount } from "../types";

import DashboardTopbar from "./DashboardTopbar";
import DashboardHeader from "./DashboardHeader";

import EventEmptyState from "../events/EventEmptyState";
import SkeletonCard from "../events/EventSkeletonCard";
import EventView from "../events/EventView";

const EMPTY_COUNT: EventsCount = {
  active: 0,
  upcoming: 0,
};

export default function DashboardView() {
  const { data: events, isLoading, isFetching, refetch } = useEventsQuery();
  const { data: eventsCount = EMPTY_COUNT } = useCountEventsQuery();

  return (
    <div className="min-h-screen bg-background">
      <motion.div variants={container} initial="hidden" animate="show">
        <DashboardTopbar />

        <Container className="px-6 md:px-10 py-8 md:py-12">
          <DashboardHeader
            eventsCount={eventsCount}
            isFetching={isFetching}
            refetch={refetch}
          />

          <AnimatePresence mode="wait">
            {isLoading ? (
              <ComponentFade key="skeleton">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              </ComponentFade>
            ) : !events?.length ? (
              <ComponentFade key="empty">
                <EventEmptyState />
              </ComponentFade>
            ) : (
              <ComponentFade key="events">
                <EventView events={events} />
              </ComponentFade>
            )}
          </AnimatePresence>
        </Container>
      </motion.div>
    </div>
  );
}
