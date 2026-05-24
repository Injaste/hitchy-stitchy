import { memo, type FC } from "react";
import { motion } from "framer-motion";

import { container } from "@/lib/animations";

import type { Event } from "../types";

import EventCard from "./EventCard";
import CreateEvent from "./EventCreate";

interface EventViewProps {
  events: Event[];
  onCreateEvent: () => void;
}

const EventView: FC<EventViewProps> = ({ events, onCreateEvent }) => (
  <motion.div
    variants={container}
    initial="hidden"
    animate="show"
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
  >
    {events.map((event) => (
      <EventCard key={event.id} event={event} />
    ))}
    <CreateEvent onCreateEvent={onCreateEvent} />
  </motion.div>
);

export default memo(EventView);
