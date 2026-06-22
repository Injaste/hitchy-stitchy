import type { FC } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import { DayLabelField, useAutosaveField } from "@/components/custom/form";
import { parseLocalDate } from "@/lib/utils/utils-time";
import { gappedListItemReveal, listLayoutTransition } from "@/lib/animations";

import { useAdminStore } from "../../store/useAdminStore";
import { useDayMutations } from "../queries";
import { useDayModalStore } from "../hooks/useDayModalStore";
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
  const { update } = useDayMutations();
  const openDeleteDay = useDayModalStore((s) => s.openDeleteDay);

  // Auto-save the label: debounced on change, flushed on blur/Enter. Empty is
  // rejected inline (and bumps attemptCount → shake); unchanged is a no-op. A
  // failed save surfaces via the mutation's error toast.
  const { value: label, error, attemptCount, onChange, flush } = useAutosaveField({
    saved: day.label,
    onSave: (next) => update.mutate({ event_id: eventId!, id: day.id, label: next }),
    validate: (v) => (v === "" ? "A label is required." : null),
  });

  const dateText = format(parseLocalDate(day.date), "EEE, d MMM yyyy");

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
        attemptCount={attemptCount}
        className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2"
      >
        <span className="min-w-32 px-1 text-xs text-muted-foreground">
          {dateText}
        </span>
        <DayLabelField
          value={label}
          onChange={onChange}
          onBlur={flush}
          onEnter={flush}
          error={error}
          aria-label={`Label for ${dateText}`}
        />
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          disabled={!canRemove}
          aria-label="Remove day"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => openDeleteDay(day)}
        >
          <Trash2 className="size-4" />
        </Button>
      </AnimateItem>
    </motion.li>
  );
};

export default DayRow;
