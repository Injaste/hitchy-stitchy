import type { FC } from "react";
import type { Event } from "../types";
import InvitedCard from "./InvitedCard";
import MemberCard from "./MemberCard";

interface EventCardProps {
  event: Event;
}

const EventCard: FC<EventCardProps> = ({ event }) => {
  if (event.is_pending) return <InvitedCard event={event} />;
  return <MemberCard event={event} />;
};

export default EventCard;
