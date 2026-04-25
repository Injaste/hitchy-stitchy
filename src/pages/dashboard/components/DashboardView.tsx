import { AnimatePresence, motion } from "framer-motion";

import Container from "@/components/custom/container";
import { ComponentFade } from "@/components/animations/animate-component-fade";

import { container, itemFadeIn, itemFadeUp } from "@/lib/animations";

import {
  useCountEventsQuery,
  useEventsQuery,
  usePendingInvitesQuery,
} from "../queries";
import type { EventsCount } from "../types";

import DashboardTopbar from "./DashboardTopbar";
import DashboardHeader from "./DashboardHeader";

import EventEmpty from "../states/EventEmpty";
import EventSkeleton from "../states/EventSkeleton";
import EventView from "../components/EventView";
import InviteView from "../components/InviteView";

const EMPTY_COUNT: EventsCount = { active: 0, upcoming: 0 };

const DashboardView = () => {
  const { data: events, isLoading, isFetching, refetch } = useEventsQuery();
  const { data: eventsCount = EMPTY_COUNT } = useCountEventsQuery();
  const { data: pendingInvites = [] } = usePendingInvitesQuery();

  return (
    <div className="min-h-screen bg-background">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={itemFadeIn}>
          <DashboardTopbar />
        </motion.div>

        <motion.div variants={itemFadeUp}>
          <Container className="px-6 md:px-10 py-8 md:py-12">
            <DashboardHeader
              eventsCount={eventsCount}
              pendingCount={pendingInvites.length}
              isLoading={isLoading}
              isFetching={isFetching}
              refetch={refetch}
            />
          </Container>
        </motion.div>

        {pendingInvites.length > 0 && (
          <motion.div variants={itemFadeUp}>
            <Container className="px-6 md:px-10 pb-4">
              <InviteView invites={pendingInvites} />
            </Container>
          </motion.div>
        )}

        <Container className="px-6 md:px-10 py-8 md:py-12">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <ComponentFade key="skeleton">
                <EventSkeleton />
              </ComponentFade>
            ) : !events?.length ? (
              <ComponentFade key="empty">
                <EventEmpty />
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
};

export default DashboardView;
