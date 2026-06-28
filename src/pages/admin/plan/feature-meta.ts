import {
  Clock,
  CheckSquare,
  Users,
  Shield,
  Mail,
  ClipboardList,
  Wallet,
  HandCoins,
  Crown,
  type LucideIcon,
} from "lucide-react";

import type { PlanFeature } from "./plan-config";

/** Per-feature icon (mirrors the sidebar) + a one-line "what it does". Shared by
 *  PlanLockedState (the locked page) and the UpgradeModal (the unlock showcase) so
 *  a feature's identity + value reads the same wherever it's surfaced. */
export const FEATURE_META: Record<
  PlanFeature,
  { icon: LucideIcon; description: string }
> = {
  timeline: {
    icon: Clock,
    description:
      "Map every cue — prep, ceremony, celebration — then run the day live as your whole team follows along.",
  },
  tasks: {
    icon: CheckSquare,
    description:
      "Track who's doing what across To do, In progress and Done, with priorities and assignees.",
  },
  members: {
    icon: Users,
    description:
      "Invite your party, vendors and coordinators — each with a clear role and just the access they need.",
  },
  access: {
    icon: Shield,
    description:
      "Fine-grained roles — decide exactly who can view and edit each part of your event.",
  },
  guests: {
    icon: ClipboardList,
    description:
      "Collect RSVPs and manage your full guest list, all in one place.",
  },
  budget: {
    icon: Wallet,
    description:
      "Log every expense and vendor, and track what's paid versus still due.",
  },
  gifts: {
    icon: HandCoins,
    description:
      "Record every ang bao, sampul duit or shagun — the tally adds up as the day goes on.",
  },
  invitation: {
    icon: Mail,
    description:
      "Design the pages your guests open and RSVP through, one per event day.",
  },
  branding: {
    icon: Crown,
    description:
      "Remove Hitchy Stitchy branding from your guest-facing invitation pages.",
  },
};
