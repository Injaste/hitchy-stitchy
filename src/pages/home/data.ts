import {
  CalendarHeart,
  CalendarDays,
  CheckSquare,
  Wallet,
  HandCoins,
  Users,
  ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Step {
  number: string;
  title: string;
  description: string;
}

export interface Feature {
  /** Matches the showcase key in Features.tsx. */
  key: string;
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
  tags: string[];
  /** Render the example in a wider box on its own row (e.g. the access matrix
   *  and the multi-day rail want more horizontal room than the 2-up grid gives). */
  wide?: boolean;
}

export interface Pillar {
  key: string;
  label: string;
  tagline: string;
  features: Feature[];
}

export const steps: Step[] = [
  {
    number: "01",
    title: "Create your event",
    description:
      "Set up your celebration — dates, details, and your unique invitation link.",
  },
  {
    number: "02",
    title: "Build your team",
    description:
      "Invite your coordinator, vendors and helpers — everyone gets a role.",
  },
  {
    number: "03",
    title: "Share your invitation",
    description:
      "Send your themed invitation; RSVPs and guest counts roll in live.",
  },
  {
    number: "04",
    title: "Run it live",
    description:
      "On the day, start each cue and your whole team follows in real time.",
  },
];

// Grouped exactly as the app groups them (Operations · Money · People · RSVP),
// so the landing page and the product tell the same story. Live Mode is the
// day-of climax and lives in its own spotlight below the pillars.
export const pillars: Pillar[] = [
  {
    key: "operations",
    label: "Operations",
    tagline: "Plan it, then run it live",
    features: [
      {
        key: "days",
        icon: CalendarDays,
        label: "Multi-day",
        title: "Built for multi-day celebrations",
        description:
          "From the akad or tea ceremony to the sangeet and the banquet — give each day its own date, and every timeline, budget and gift stays filed under the right one.",
        tags: ["Multi-day", "Per-day timeline", "Per-day budget"],
        wide: true,
      },
      {
        key: "timeline",
        icon: CalendarHeart,
        label: "Timeline",
        title: "Every cue, down to the minute",
        description:
          "Each moment — prep, the ceremony, the celebration — gets a time, venue and owner. On the day, start each cue and the whole team follows in real time.",
        tags: ["Multi-day", "Live on the day", "Real-time cues"],
        wide: true,
      },
      {
        key: "tasks",
        icon: CheckSquare,
        label: "Tasks",
        title: "A board for every to-do",
        description:
          "Track who's doing what across To do, In progress and Done — with labels, priorities and assignees.",
        tags: ["Kanban", "Priorities", "Assignees"],
        wide: true,
      },
    ],
  },
  {
    key: "money",
    label: "Money",
    tagline: "Track every dollar, in and out",
    features: [
      {
        key: "budget",
        icon: Wallet,
        label: "Budget",
        title: "Know what's paid, what's due",
        description:
          "Log every expense and vendor, mark deposits and payments, and watch the totals settle.",
        tags: ["Expenses", "Vendors", "Paid tracking"],
      },
      {
        key: "gifts",
        icon: HandCoins,
        label: "Gift Envelopes",
        title: "An envelope ledger that adds up",
        description:
          "Record every ang bao, sampul duit or shagun by who gave it — the tally climbs as the day goes on.",
        tags: ["Ang bao", "Sampul duit", "Shagun"],
      },
    ],
  },
  {
    key: "people",
    label: "People",
    tagline: "Bring your people together",
    features: [
      {
        key: "team",
        icon: Users,
        label: "Members",
        title: "Everyone in their role",
        description:
          "Invite your party, vendors and coordinators — each with a clear role and just the access they need. Money stays private; the timeline stays shared.",
        tags: ["Roles", "Per-feature access", "Private money"],
      },
    ],
  },
  {
    key: "rsvp",
    label: "RSVP",
    tagline: "Hear back from your guests",
    features: [
      {
        key: "rsvp",
        icon: ClipboardList,
        label: "RSVP & Guest List",
        title: "Your guest list, beautifully handled",
        description:
          "A custom RSVP form on your invitation captures names, guest counts and notes — then responses flow in live.",
        tags: ["Custom fields", "Live responses", "Guest list"],
      },
    ],
  },
];
