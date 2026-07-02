import type { PlanFeature } from "@/pages/admin/plan/plan-config";
import type { SetupCounts } from "./api";

export type SetupStepId =
  | "days"
  | "timeline"
  | "liverun"
  | "tasks"
  | "budget"
  | "gifts"
  | "members"
  | "access"
  | "invitation"
  | "guests";

export interface SetupStep {
  id: SetupStepId;
  label: string;
  description: string;
  /** Navigate to this admin sub-path. Mutually exclusive with settingsSection. */
  route?: string;
  /** Or open Event Settings to this section (the days step lives in settings). */
  settingsSection?: string;
  /** DERIVED from live data — auto-ticks when the thing is done, retroactively. */
  completed: boolean;
  /** The plan tier unlocks this feature. The whole guide is super-admin-only, so
   *  access never gates a step — only whether the tier includes it. */
  unlocked: boolean;
  /** A review step (e.g. access) — completes on being seen and has no single action
   *  to point at, so following it does NOT arm the tour spotlight. */
  viewOnly?: boolean;
  /** Opens a self-contained demo modal instead of a route/settings section (the
   *  live-run practice). Completes on being opened, like a view-only step. */
  demo?: boolean;
  /** A prerequisite isn't met yet (e.g. guests need an invitation first): the row
   *  is shown disabled with `lockedHint` instead of being actionable. */
  locked?: boolean;
  lockedHint?: string;
}

export interface SetupGroup {
  id: string;
  label: string;
  steps: SetupStep[];
}

/** Completion inputs come from THREE sources by design, not one — don't merge them:
 *  - usage       — capped / RLS-restricted resources from the plan store (members),
 *                  kept live by its mutation. members can't be a count: event_members
 *                  is own-row under RLS, so a count query only ever sees you.
 *  - counts      — existence counts for feature data (timeline/tasks/…), refreshed
 *                  via useSetupCountsSync. Different trust + freshness paths from usage.
 *  - viewedSteps — steps with nothing to count: a read-only page (access) or an
 *                  already-set value to review (days). Complete on being opened. */
export interface SetupContext {
  usage: { members: number };
  counts: SetupCounts;
  /** Step ids completed by being viewed — a read-only page ("access") or an
   *  already-set value to review ("days"). See SetupContext above. */
  viewedSteps: string[];
  canUseFeature: (f: PlanFeature) => boolean;
}

/** The full, grouped setup checklist. Order starts with the foundation (event days)
 *  then walks the suite group by group. Each group keeps only the steps the plan
 *  unlocks; empty groups drop out, so Starter sees a shorter list with no gaps. */
export function buildSetupGroups({
  usage,
  counts,
  viewedSteps,
  canUseFeature,
}: SetupContext): SetupGroup[] {
  const groups: SetupGroup[] = [
    {
      id: "basics",
      label: "The basics",
      steps: [
        {
          // The doorway to the event-wide settings — dates, display name and
          // notifications all live in the one modal, so opening it surfaces them
          // together. Not an "add"; completes on being opened (tracked in
          // viewed_steps), the same view-only pattern as the read-only Access step.
          id: "days",
          label: "Review your event settings",
          description: "Your dates, display name and notifications — review them all here.",
          settingsSection: "days",
          completed: viewedSteps.includes("days"),
          unlocked: true,
        },
      ],
    },
    {
      id: "plan",
      label: "Plan the day",
      steps: [
        {
          id: "timeline",
          label: "Build your run-of-show",
          description: "Lay out the order of the day.",
          route: "timeline",
          completed: counts.timeline > 0,
          unlocked: canUseFeature("timeline"),
        },
        {
          // Live-run is a day-of feature, not setup data — so we TEACH it with a
          // safe, self-contained demo (no real cue is started). Completes once the
          // demo has been opened; hidden for tiers without the sub-feature.
          id: "liverun",
          label: "Run your day live",
          description: "Start and end each cue in real time — give it a try.",
          demo: true,
          completed: viewedSteps.includes("liverun"),
          unlocked: canUseFeature("timeline_liverun"),
        },
      ],
    },
    {
      id: "tasks",
      label: "Tasks",
      steps: [
        {
          id: "tasks",
          label: "Add your to-dos",
          description: "Track everything that needs doing.",
          route: "tasks",
          completed: counts.tasks > 0,
          unlocked: canUseFeature("tasks"),
        },
      ],
    },
    {
      id: "money",
      label: "Budget & Gifts",
      steps: [
        {
          id: "budget",
          label: "Set your budget",
          description: "Plan and track what you spend.",
          route: "budget",
          completed: counts.expenses > 0,
          unlocked: canUseFeature("budget"),
        },
        {
          id: "gifts",
          label: "Track gifts",
          description: "Record gifts as they come in.",
          route: "gifts",
          completed: counts.gifts > 0,
          unlocked: canUseFeature("gifts"),
        },
      ],
    },
    {
      id: "team",
      label: "Your team",
      steps: [
        {
          // Before members: inviting someone means picking a role for them, so it
          // helps to know the roles first. The Access page is read-only, so this
          // completes once it's been opened (tracked in viewed_steps).
          id: "access",
          label: "Review your access roles",
          description: "See who can view and edit what — you pick a role per invite.",
          route: "access",
          completed: viewedSteps.includes("access"),
          unlocked: canUseFeature("access"),
          viewOnly: true,
        },
        {
          id: "members",
          label: "Invite collaborators",
          description: "Bring helpers in and give each a role.",
          // Creation seeds one member (the creator), so > 1 means a real invite.
          route: "members",
          completed: usage.members > 1,
          unlocked: canUseFeature("members"),
        },
      ],
    },
    {
      id: "rsvp",
      label: "Invitations & RSVPs",
      steps: [
        {
          id: "invitation",
          label: "Build your invitation",
          description: "Design the page your guests will open.",
          route: "invitation",
          completed: counts.invitations > 0,
          unlocked: canUseFeature("invitation"),
        },
        {
          id: "guests",
          label: "Add your guest list",
          description: "Invite the people to celebrate with.",
          route: "guests",
          completed: counts.guests > 0,
          unlocked: canUseFeature("guests"),
          // Guests are attached to an invitation — no invitation, nothing to add to.
          locked: counts.invitations === 0,
          lockedHint: "Create your invitation first",
        },
      ],
    },
  ];

  return groups
    .map((g) => ({ ...g, steps: g.steps.filter((s) => s.unlocked) }))
    .filter((g) => g.steps.length > 0);
}
