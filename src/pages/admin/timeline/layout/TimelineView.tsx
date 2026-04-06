import { AnimatePresence, motion } from "framer-motion";

import { ComponentFade } from "@/components/animations/animate-component-fade";

import { useTimelineQuery } from "../queries";

import TimelineEmpty from "../states/EventEmpty";
import TimelineSkeleton from "../states/EventSkeleton";

import EventView from "../components/EventView";
import Container from "@/components/custom/container";
import { container, itemFadeUp } from "@/lib/animations";
import TimelineHeader from "./TimelineHeader";

const TimelineView = () => {
  const {
    data: timelines,
    isLoading,
    isFetching,
    refetch,
  } = useTimelineQuery();
  const testTimeline = [];

  return (
    <div className="min-h-screen bg-background">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={itemFadeUp}>
          <Container className="px-6 md:px-10 py-8 md:py-12">
            <TimelineHeader
              isLoading={isLoading}
              isFetching={isFetching}
              refetch={refetch}
            />
          </Container>
        </motion.div>

        <Container className="px-6 md:px-10 py-8 md:py-12">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <ComponentFade key="skeleton">
                <TimelineSkeleton />
              </ComponentFade>
            ) : !testTimeline?.length ? (
              <ComponentFade key="empty">
                <TimelineEmpty />
              </ComponentFade>
            ) : (
              <ComponentFade key="events">
                <EventView />
              </ComponentFade>
            )}
          </AnimatePresence>
        </Container>
      </motion.div>
    </div>
  );
};

export default TimelineView;
