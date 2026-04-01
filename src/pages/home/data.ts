import { CalendarHeart, ClipboardList, Users, Radio } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface StatItem {
  value: string;
  label: string;
}

export interface Testimonial {
  quote: string;
  names: string;
  event: string;
}

export interface Step {
  number: string;
  title: string;
  description: string;
}

export interface Feature {
  key: string;
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
  tags: string[];
}

export const stats: StatItem[] = [
  { value: "120+", label: "Events planned" },
  { value: "4,800+", label: "Guests managed" },
  { value: "2,300+", label: "Planners on the platform" },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "Hitchy Stitchy turned our 3-day wedding into a seamlessly run production. Our coordinator said it was the most organised event she'd ever worked.",
    names: "Amara & Kofi",
    event: "3-day Traditional + White Wedding",
  },
  {
    quote:
      "The live mode on the day was a game changer. Every team member knew exactly where to be. No frantic calls, no chaos — just pure magic.",
    names: "Priya & Rajan",
    event: "Garden Wedding",
  },
  {
    quote:
      "From RSVP tracking to the final cue, everything lived in one place. I can't imagine planning without it.",
    names: "Sophie & James",
    event: "Country Estate Wedding",
  },
  {
    quote:
      "We had 11 vendors across 2 days. Hitchy Stitchy kept every single one of them in sync. Absolutely indispensable.",
    names: "Olivia & Tom",
    event: "Vineyard Weekend Wedding",
  },
  {
    quote:
      "Our planner recommended it and within an hour we had our entire team set up with roles and tasks. So intuitive.",
    names: "Zara & Kwame",
    event: "Intimate Beach Ceremony",
  },
];

export const steps: Step[] = [
  {
    number: "01",
    title: "Create your event",
    description:
      "Set up your wedding details — name, dates, and your unique invitation link.",
  },
  {
    number: "02",
    title: "Build your team",
    description:
      "Invite your coordinator, vendors, and wedding party. Everyone gets a role.",
  },
  {
    number: "03",
    title: "Live on the day",
    description:
      "Activate Live Mode. Real-time cues, arrivals, and coordination at your fingertips.",
  },
];

export const features: Feature[] = [
  {
    key: "timeline",
    icon: CalendarHeart,
    label: "Event Timeline",
    title: "Orchestrate every cue, down to the minute",
    description:
      "Plan each day of your wedding with precision. Every cue — from bridal prep to the first dance — gets a time, venue, and owner. Multi-day events, handled beautifully.",
    tags: ["Multi-day support", "Venue tagging", "Role assignment"],
  },
  {
    key: "rsvp",
    icon: ClipboardList,
    label: "RSVP Management",
    title: "Your guest list, beautifully handled",
    description:
      "A fully customisable RSVP form tailored to your wedding. Capture names, dietary notes, guest counts, and more — then watch responses flow in live.",
    tags: ["Custom fields", "Real-time tracking", "Deadline control"],
  },
  {
    key: "team",
    icon: Users,
    label: "Team Coordination",
    title: "Everyone in the right place at the right time",
    description:
      "Assign your wedding party, vendors, and coordinators to named roles. Each person understands their responsibilities from day one, no confusion on the day.",
    tags: ["Role-based access", "Task assignment", "Vendor support"],
  },
  {
    key: "live",
    icon: Radio,
    label: "Live Event Mode",
    title: "Run the day with total confidence",
    description:
      "Activate Live Mode on your wedding day. Real-time cue notifications, arrival check-ins, and a shared event log keep your entire team perfectly in sync.",
    tags: ["Real-time cues", "Arrival check-ins", "Shared event log"],
  },
];
