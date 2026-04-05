import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminStore } from "../../store/useAdminStore";

interface TimelineDayTabsProps {
  activeDayId: string;
  onSelectDay: (dayId: string) => void;
}

export function TimelineDayTabs({
  activeDayId,
  onSelectDay,
}: TimelineDayTabsProps) {
  const { days } = useAdminStore();

  if (days.length <= 1) return null;

  return (
    <div className="flex gap-2 mb-4 overflow-x-auto">
      {days.map((day) => (
        <Button
          key={day.id}
          variant={activeDayId === day.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectDay(day.id)}
          className={cn(
            "shrink-0 text-xs",
            activeDayId !== day.id && "text-muted-foreground",
          )}
        >
          {day.label}
        </Button>
      ))}
    </div>
  );
}
