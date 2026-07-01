import { Link, useParams } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEventSettingsStore } from "../settings/useEventSettingsStore";
import { useTourSpotlight } from "./useTourSpotlight";
import type { SetupStep } from "./setupSteps";

/** One checklist row, shared by the widget and the Event Settings list. Every step
 *  is clickable — incomplete to go do it, complete to revisit/replay it (the days
 *  step opens Event Settings). The ✓ sits beside the title; the arrow is centered. */
export default function SetupStepRow({
  step,
  onNavigate,
}: {
  step: SetupStep;
  onNavigate?: () => void;
}) {
  const { slug } = useParams();
  const openSettings = useEventSettingsStore((s) => s.open);
  const armSpotlight = useTourSpotlight((s) => s.arm);
  const disarmSpotlight = useTourSpotlight((s) => s.disarm);

  const body = (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium",
            step.completed && "text-muted-foreground",
          )}
        >
          <span className={cn(step.completed && "line-through")}>
            {step.label}
          </span>
          {step.completed && <Check className="size-3 shrink-0 text-primary" />}
        </p>
        <p className="text-2xs text-muted-foreground">{step.description}</p>
      </div>
      <ArrowRight className="size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover/step:translate-x-0 group-hover/step:opacity-100" />
    </div>
  );

  const cls =
    "group/step block w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-primary/5 cursor-pointer";

  if (step.settingsSection) {
    const section = step.settingsSection;
    return (
      <button
        type="button"
        className={cls}
        onClick={() => {
          // Opens a self-focused settings modal, not an action to point at — close
          // any open spotlight so it doesn't linger behind the modal.
          disarmSpotlight();
          openSettings(section);
          onNavigate?.();
        }}
      >
        {body}
      </button>
    );
  }

  const route = step.route;
  return (
    <Link
      to={`/${slug}/admin/${route}`}
      onClick={() => {
        // An ACTION route step points the spotlight at that page's action button
        // (re-targeting a live spotlight). A view-only step (access) has nothing to
        // point at, so it closes the spotlight instead.
        if (route && !step.viewOnly) armSpotlight(route);
        else disarmSpotlight();
        onNavigate?.();
      }}
      className={cls}
    >
      {body}
    </Link>
  );
}
