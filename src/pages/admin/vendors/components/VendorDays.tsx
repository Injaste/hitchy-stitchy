import type { FC } from "react";
import { Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useActiveEventDay } from "../../hooks/useActiveEventDay";
import { dayLabel } from "../../days/utils";

interface VendorDaysProps {
  dayIds: string[];
  className?: string;
}

/** The days a vendor works, as chips in chronological order. Nothing renders on a
 *  single-day event (there's no day to scope to) or when the vendor is untagged —
 *  so cards without day tags stay clean rather than showing an empty rail.
 *
 *  Tagged to EVERY day collapses to one "All days" chip: that's the common case
 *  for a planner or venue, and listing every label just to say "all of them" is
 *  noise that wraps badly. Note untagged (renders nothing) and all-tagged are
 *  deliberately different states — "no specific day" vs "explicitly every day". */
const VendorDays: FC<VendorDaysProps> = ({ dayIds, className }) => {
  const { days, multiDay } = useActiveEventDay();
  if (!multiDay || dayIds.length === 0) return null;

  const chip = (label: string) => (
    <Badge key={label} variant="outline" className="gap-1 font-normal">
      <Calendar className="size-3 shrink-0" />
      {label}
    </Badge>
  );

  // Every live day tagged → collapse. (Compared against live days, so a tag for a
  // deleted day can never make this read as "all".)
  if (days.every((day) => dayIds.includes(day.id))) {
    return (
      <div className={cn("flex flex-wrap items-center gap-1", className)}>
        {chip("All days")}
      </div>
    );
  }

  // Walk the event's days (chronological) and keep the tagged ones, so badges
  // read Akad → Sangeet → Banquet regardless of tag order.
  const labels = days
    .map((day, index) => (dayIds.includes(day.id) ? dayLabel(day.label, index) : null))
    .filter((l): l is string => l !== null);
  if (labels.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {labels.map(chip)}
    </div>
  );
};

export default VendorDays;
