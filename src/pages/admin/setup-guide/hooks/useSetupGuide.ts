import { useAdminStore } from "../../store/useAdminStore";
import { usePlan } from "../../hooks/usePlan";
import { useAccess } from "../../hooks/useAccess";
import { buildSetupGroups, type SetupGroup, type SetupStep } from "../setupSteps";
import {
  useTutorialStateQuery,
  useSetupCountsQuery,
  useSetTutorialStateMutation,
} from "../queries";
import type { TutorialState } from "../api";

const EMPTY_COUNTS = {
  timeline: 0,
  tasks: 0,
  expenses: 0,
  gifts: 0,
  invitations: 0,
  guests: 0,
};
const EMPTY_STATE: TutorialState = {
  dismissedBy: [],
  celebratedBy: [],
  minimisedBy: [],
  viewedSteps: [],
};

export interface SetupGuide {
  /** Super-admin, event activated, AND at least one available step. Every surface
   *  keys off this — false hides the widget, spotlight, and demo entirely. */
  active: boolean;
  /** The persisted state (dismissed/minimised) has been fetched. The widget holds its
   *  render until this is true so it never flashes the wrong form (maximised then
   *  snapping to the pill). Derived completion doesn't wait on it. */
  stateReady: boolean;
  groups: SetupGroup[];
  steps: SetupStep[];
  doneCount: number;
  totalCount: number;
  nextStep: SetupStep | null;
  /** First incomplete step that is a ROUTE (the landing redirect target). */
  nextRoute: string | null;
  isComplete: boolean;
  dismissed: boolean;
  dismiss: () => void;
  replay: () => void;
  /** This member has collapsed the widget to its pill. Persisted per-member (like
   *  dismissal) so it survives reloads and follows them across devices. */
  minimised: boolean;
  setMinimised: (minimised: boolean) => void;
  /** This member has already seen the completion confetti (fire it once, ever). */
  celebrated: boolean;
  /** Record that this member has now seen the confetti, so it never fires again. */
  markCelebrated: () => void;
  /** Mark a view-only step (e.g. "access") complete once it's been opened. */
  markViewed: (stepId: string) => void;
}

/** The one hook every setup-guide surface reads. Completion is derived from live
 *  usage + feature counts + viewed-steps; the guide is super-admin-only. */
export function useSetupGuide(): SetupGuide {
  const usage = useAdminStore((s) => s.plan.usage);
  const memberId = useAdminStore((s) => s.memberId);
  const { canUseFeature, isPending } = usePlan();
  const { isSuperAdmin } = useAccess();

  const { data: counts } = useSetupCountsQuery();
  const { data: state } = useTutorialStateQuery();
  const stateM = useSetTutorialStateMutation();
  const current = state ?? EMPTY_STATE;
  const stateReady = state !== undefined;

  const groups = buildSetupGroups({
    usage,
    counts: counts ?? EMPTY_COUNTS,
    viewedSteps: current.viewedSteps,
    canUseFeature,
  });
  const steps = groups.flatMap((g) => g.steps);
  // The guide stays hidden until the event is activated (isPending = awaiting
  // payment): a fresh unactivated event should have a clean UI, and every "add"
  // would only hit the activation paywall anyway.
  const active = isSuperAdmin && !isPending && steps.length > 0;

  const doneCount = steps.filter((s) => s.completed).length;
  const nextStep = steps.find((s) => !s.completed) ?? null;
  const nextRoute = steps.find((s) => !s.completed && s.route)?.route ?? null;

  return {
    active,
    stateReady,
    groups,
    steps,
    doneCount,
    totalCount: steps.length,
    nextStep,
    nextRoute,
    isComplete: steps.length > 0 && !nextStep,
    // Dismissal is per-member: this member is dismissed only if their id is listed.
    dismissed: !!memberId && current.dismissedBy.includes(memberId),
    dismiss: () => {
      if (!memberId || current.dismissedBy.includes(memberId)) return;
      stateM.mutate({
        ...current,
        dismissedBy: [...current.dismissedBy, memberId],
      });
    },
    replay: () =>
      stateM.mutate({
        ...current,
        dismissedBy: current.dismissedBy.filter((id) => id !== memberId),
      }),
    // Minimise is per-member, mirroring dismissal: a member is minimised only if their
    // id is listed. Expanding removes it. Skip the write when already in the target state.
    minimised: !!memberId && current.minimisedBy.includes(memberId),
    setMinimised: (next) => {
      if (!memberId || current.minimisedBy.includes(memberId) === next) return;
      stateM.mutate({
        ...current,
        minimisedBy: next
          ? [...current.minimisedBy, memberId]
          : current.minimisedBy.filter((id) => id !== memberId),
      });
    },
    celebrated: !!memberId && current.celebratedBy.includes(memberId),
    markCelebrated: () => {
      if (!memberId || current.celebratedBy.includes(memberId)) return;
      stateM.mutate({
        ...current,
        celebratedBy: [...current.celebratedBy, memberId],
      });
    },
    markViewed: (stepId) => {
      if (!current.viewedSteps.includes(stepId)) {
        stateM.mutate({ ...current, viewedSteps: [...current.viewedSteps, stepId] });
      }
    },
  };
}
