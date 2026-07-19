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
 *  so cards without day tags stay clean rather than showing an empty rail. */
const VendorDays: FC<VendorDaysProps> = ({ dayIds, className }) => {
  const { days, multiDay } = useActiveEventDay();
  if (!multiDay || dayIds.length === 0) return null;

  // Walk the event's days (chronological) and keep the tagged ones, so badges
  // read Akad → Sangeet → Banquet regardless of tag order.
  const labels = days
    .map((day, index) => (dayIds.includes(day.id) ? dayLabel(day.label, index) : null))
    .filter((l): l is string => l !== null);
  if (labels.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {labels.map((label) => (
        <Badge key={label} variant="outline" className="gap-1 font-normal">
          <Calendar className="size-3 shrink-0" />
          {label}
        </Badge>
      ))}
    </div>
  );
};

export default VendorDays;
