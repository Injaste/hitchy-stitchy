import { useAdminStore } from "../store/useAdminStore";
import { usePlan } from "../hooks/usePlan";
import { useAccess } from "../hooks/useAccess";
import { buildSetupGroups, type SetupGroup, type SetupStep } from "./setupSteps";
import {
  useTutorialStateQuery,
  useSetupCountsQuery,
  useSetTutorialStateMutation,
} from "./queries";
import type { TutorialState } from "./api";

const EMPTY_COUNTS = {
  timeline: 0,
  tasks: 0,
  expenses: 0,
  gifts: 0,
  invitations: 0,
  guests: 0,
};
const EMPTY_STATE: TutorialState = { dismissed: false, viewedSteps: [] };

export interface SetupGuide {
  /** Super-admin AND at least one available step. Every surface keys off this. */
  active: boolean;
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
  /** Mark a view-only step (e.g. "access") complete once it's been opened. */
  markViewed: (stepId: string) => void;
}

/** The one hook every setup-guide surface reads. Completion is derived from live
 *  usage + feature counts + viewed-steps; the guide is super-admin-only. */
export function useSetupGuide(): SetupGuide {
  const usage = useAdminStore((s) => s.plan.usage);
  const { canUseFeature } = usePlan();
  const { isSuperAdmin } = useAccess();

  const { data: counts } = useSetupCountsQuery();
  const { data: state } = useTutorialStateQuery();
  const stateM = useSetTutorialStateMutation();
  const current = state ?? EMPTY_STATE;

  const groups = buildSetupGroups({
    usage,
    counts: counts ?? EMPTY_COUNTS,
    viewedSteps: current.viewedSteps,
    canUseFeature,
  });
  const steps = groups.flatMap((g) => g.steps);
  const active = isSuperAdmin && steps.length > 0;

  const doneCount = steps.filter((s) => s.completed).length;
  const nextStep = steps.find((s) => !s.completed) ?? null;
  const nextRoute = steps.find((s) => !s.completed && s.route)?.route ?? null;

  return {
    active,
    groups,
    steps,
    doneCount,
    totalCount: steps.length,
    nextStep,
    nextRoute,
    isComplete: steps.length > 0 && !nextStep,
    dismissed: current.dismissed,
    dismiss: () => stateM.mutate({ ...current, dismissed: true }),
    replay: () => stateM.mutate({ ...current, dismissed: false }),
    markViewed: (stepId) => {
      if (!current.viewedSteps.includes(stepId)) {
        stateM.mutate({ ...current, viewedSteps: [...current.viewedSteps, stepId] });
      }
    },
  };
}
