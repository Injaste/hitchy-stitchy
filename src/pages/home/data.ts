import {
  CalendarHeart,
  CheckSquare,
  Wallet,
  HandCoins,
  Users,
  Shield,
  ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Step {
  number: string;
  title: string;
  description: string;
}

export interface Feature {
  /** Matches the mock key in Features.tsx. */
  key: string;
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
  tags: string[];
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

// Grouped exactly as the app groups them (Operations · Money · Teams · RSVP),
// so the landing page and the product tell the same story. Live Mode is the
// day-of climax and lives in its own spotlight below the pillars.
export const pillars: Pillar[] = [
  {
    key: "operations",
    label: "Operations",
    tagline: "Plan it, then run it live",
    features: [
      {
        key: "timeline",
        icon: CalendarHeart,
        label: "Timeline",
        title: "Every cue, down to the minute",
        description:
          "Each moment — prep, tea ceremony, first dance — gets a time, venue and owner. On the day, start each cue and the whole team follows in real time.",
        tags: ["Multi-day", "Live on the day", "Real-time cues"],
      },
      {
        key: "tasks",
        icon: CheckSquare,
        label: "Tasks",
        title: "A board for every to-do",
        description:
          "Track who's doing what across To do, In progress and Done — with labels, priorities and assignees.",
        tags: ["Kanban", "Priorities", "Assignees"],
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
          "Record every ang bao, cash or PayNow gift by who gave it — the tally climbs as the day goes on.",
        tags: ["Ang bao", "PayNow", "Per day"],
      },
    ],
  },
  {
    key: "teams",
    label: "Teams",
    tagline: "Bring your people together",
    features: [
      {
        key: "team",
        icon: Users,
        label: "Members",
        title: "Everyone in their role",
        description:
          "Invite your wedding party, vendors and coordinators — each with a clear role on the day.",
        tags: ["Roles", "Vendors", "Invites"],
      },
      {
        key: "access",
        icon: Shield,
        label: "Access",
        title: "Control who sees what",
        description:
          "Grant each group View or Full access per feature — money stays private, the timeline stays shared.",
        tags: ["Per-feature", "View / Full", "Private money"],
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
