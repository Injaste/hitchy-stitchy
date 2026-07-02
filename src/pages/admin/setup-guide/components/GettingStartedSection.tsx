import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEventSettingsStore } from "../../settings/useEventSettingsStore";
import { useSetupGuide } from "../hooks/useSetupGuide";
import SetupStepRow from "./SetupStepRow";

/** The always-available home for the setup guide, inside Event Settings — the full
 *  list (every group), for review or to bring the guide back after dismissing it. */
export default function GettingStartedSection() {
  const close = useEventSettingsStore((s) => s.close);
  const { active, groups, doneCount, totalCount, isComplete, dismissed, replay } =
    useSetupGuide();

  if (!active) {
    return (
      <p className="text-sm text-muted-foreground">
        You're all set — nothing to set up right now.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {isComplete
            ? "Everything's ready 🎉"
            : `${doneCount} of ${totalCount} steps complete`}
        </p>
        {dismissed && (
          <Button variant="outline" size="sm" onClick={replay}>
            Show guide again
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {groups.map((group) => {
          const gDone = group.steps.filter((s) => s.completed).length;
          const gComplete = gDone === group.steps.length;
          return (
            <div key={group.id} className="rounded-xl ring-1 ring-border">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium">{group.label}</span>
                {gComplete ? (
                  <Check className="size-4 text-primary" />
                ) : (
                  <span className="text-2xs font-semibold text-muted-foreground">
                    {gDone}/{group.steps.length}
                  </span>
                )}
              </div>
              <div className="p-1">
                {group.steps.map((step) => (
                  <SetupStepRow key={step.id} step={step} onNavigate={close} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
