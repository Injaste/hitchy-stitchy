import { EventLogPanel } from "./EventLogPanel";
import { BridesmaidsCheckin } from "./BridesmaidsCheckin";

export function LiveTab() {
  return (
    <div className="pb-24 space-y-6">
      <EventLogPanel />
      <BridesmaidsCheckin />
    </div>
  );
}
