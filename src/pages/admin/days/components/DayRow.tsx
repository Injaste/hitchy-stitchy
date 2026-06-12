import { useState, type FC } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import { DayLabelField } from "@/components/custom/form";
import { parseLocalDate } from "@/lib/utils/utils-time";
import { gappedListItemReveal, listLayoutTransition } from "@/lib/animations";

import { useAdminStore } from "../../store/useAdminStore";
import { useDayMutations } from "../queries";
import type { EventDay } from "../types";

interface DayRowProps {
  day: EventDay;
  canManage: boolean;
  canRemove: boolean;
}

const rowMotion = {
  variants: gappedListItemReveal,
  initial: "hidden" as const,
  animate: "show" as const,
  exit: "exit" as const,
  transition: listLayoutTransition,
};

const DayRow: FC<DayRowProps> = ({ day, canManage, canRemove }) => {
  const { eventId } = useAdminStore();
  const { update, remove } = useDayMutations();
  const [label, setLabel] = useState(day.label);
  const [error, setError] = useState<string | null>(null);
  const [shakeTick, setShakeTick] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const dateText = format(parseLocalDate(day.date), "EEE, d MMM yyyy");

  // Save on blur / Enter (Notion-style) — no explicit save button. Empty is
  // rejected inline; unchanged is a no-op.
  const commit = () => {
    const trimmed = label.trim();
    if (trimmed === "") {
      setError("A label is required.");
      setShakeTick((t) => t + 1);
      return;
    }
    setError(null);
    if (trimmed === day.label) return;
    // A failed save surfaces via the mutation's error toast; the inline error is
    // for the empty-label case above.
    update.mutate({ event_id: eventId!, id: day.id, label: trimmed });
  };

  if (!canManage) {
    return (
      <motion.li {...rowMotion}>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
          <span className="text-sm font-medium">{day.label}</span>
          <span className="text-xs text-muted-foreground">{dateText}</span>
        </div>
      </motion.li>
    );
  }

  return (
    <motion.li {...rowMotion}>
      <AnimateItem
        hasError={!!error}
        attemptCount={shakeTick}
        className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2"
      >
        <span className="min-w-32 px-1 text-xs text-muted-foreground">
          {dateText}
        </span>
        <DayLabelField
          value={label}
          onChange={(v) => {
            setLabel(v);
            if (error) setError(null);
          }}
          onBlur={commit}
          onEnter={commit}
          error={error}
          aria-label={`Label for ${dateText}`}
        />
        <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              disabled={!canRemove}
              aria-label="Remove day"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 space-y-3">
            <p className="text-sm">
              Remove <span className="font-medium">{day.label}</span>? This also
              deletes that day's schedule items.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={remove.isPending}
                onClick={() =>
                  remove.mutate(
                    { event_id: eventId!, id: day.id },
                    { onSuccess: () => setConfirmOpen(false) },
                  )
                }
              >
                Remove
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </AnimateItem>
    </motion.li>
  );
};

export default DayRow;
