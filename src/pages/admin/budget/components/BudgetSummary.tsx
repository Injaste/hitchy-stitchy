import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FC } from "react";
import { motion } from "framer-motion";
import { Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import IconSwap from "@/components/animations/animate-icon-swap";

import { useBudgetMutations } from "../queries";
import { useAccess } from "../../hooks/useAccess";
import { formatNum } from "@/lib/money";
import { type BudgetSummary as SummaryData } from "../utils";
import BudgetStats from "./BudgetStats";

interface BudgetSummaryProps {
  summary: SummaryData;
  /** Active day's name — present on multi-day events so the hero reads as the
   *  day's budget rather than the (whole-wedding) total. */
  scopeLabel?: string;
}

const BudgetSummary: FC<BudgetSummaryProps> = ({ summary, scopeLabel }) => {
  const { update } = useBudgetMutations();
  const { canUpdate } = useAccess();
  const canEdit = canUpdate("budget");
  const { budgetTotal } = summary;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [inputWidth, setInputWidth] = useState<number>();
  const inputRef = useRef<HTMLInputElement>(null);
  const sizerRef = useRef<HTMLSpanElement>(null);
  // Latch so the first of commit/cancel wins; the input's unmount-blur is ignored.
  const doneRef = useRef(false);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  // Match the input box to the *formatted* value width so the edit icon never
  // shifts horizontally between display and edit.
  useLayoutEffect(() => {
    if (editing && sizerRef.current)
      setInputWidth(sizerRef.current.offsetWidth);
  }, [editing, draft]);

  const startEdit = () => {
    doneRef.current = false;
    setDraft(budgetTotal !== null ? String(budgetTotal) : "");
    setEditing(true);
  };

  const commit = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setEditing(false);

    const raw = draft.trim().replace(/[, ]/g, "");
    if (raw === "") {
      if (budgetTotal !== null) update.mutate(null); // cleared → remove the budget
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return; // invalid → keep the current value
    if (n !== budgetTotal) update.mutate(n);
  };

  const cancel = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setEditing(false);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent>
        <div className="min-w-0">
          <div className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
            {scopeLabel ? `${scopeLabel} budget` : "Total budget"}
          </div>

          <div className="mt-0.5 flex items-center gap-1">
            {editing ? (
              <span className="relative isolate flex items-baseline gap-1.5">
                {/* Faint highlight fades in to signal the active field. */}
                <motion.span
                  aria-hidden
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.18 }}
                  className="pointer-events-none absolute -inset-x-1.5 -inset-y-1 -z-10 rounded-md"
                />
                <span className="text-sm font-semibold text-muted-foreground">
                  S$
                </span>
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) =>
                    setDraft(e.target.value.replace(/[^\d]/g, ""))
                  }
                  onBlur={commit}
                  onKeyDown={handleKeyDown}
                  inputMode="numeric"
                  placeholder="0"
                  aria-label="Total budget"
                  // Width matched to the formatted value so the icon beside it
                  // doesn't shift; the underline is an absolute element (below),
                  // so it adds no layout box.
                  style={{
                    width:
                      inputWidth != null
                        ? `${inputWidth}px`
                        : `${Math.max(draft.length, 1)}ch`,
                  }}
                  className="bg-transparent p-0 font-display text-3xl font-bold tabular-nums outline-none placeholder:text-muted-foreground/40"
                />
                {/* Ring-bottom underline, grown in on enter. */}
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="absolute right-0 -bottom-0.5 left-0 h-0.5 origin-left rounded-full bg-ring/70"
                />
                {/* Hidden sizer: the formatted value drives the input's width. */}
                <span
                  ref={sizerRef}
                  aria-hidden
                  className="pointer-events-none invisible absolute font-display text-3xl font-bold tabular-nums whitespace-pre"
                >
                  {formatNum(Number(draft) || 0)}
                </span>
              </span>
            ) : budgetTotal !== null ? (
              canEdit ? (
                <button
                  type="button"
                  onClick={startEdit}
                  aria-label="Edit budget"
                  className="flex cursor-pointer items-baseline gap-1.5"
                >
                  <span className="text-sm font-semibold text-muted-foreground">
                    S$
                  </span>
                  <span className="font-display text-3xl font-bold tabular-nums">
                    {formatNum(budgetTotal)}
                  </span>
                </button>
              ) : (
                <span className="flex items-baseline gap-1.5">
                  <span className="text-sm font-semibold text-muted-foreground">
                    S$
                  </span>
                  <span className="font-display text-3xl font-bold tabular-nums">
                    {formatNum(budgetTotal)}
                  </span>
                </span>
              )
            ) : canEdit ? (
              <button
                type="button"
                onClick={startEdit}
                className="cursor-pointer font-display text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Set a budget
              </button>
            ) : (
              <span className="font-display text-lg font-semibold text-muted-foreground">
                No budget set
              </span>
            )}

            {canEdit && (editing || budgetTotal !== null) && (
              <Button
                variant="ghost"
                size="sm"
                className="size-7 shrink-0 p-0 text-muted-foreground"
                aria-label={editing ? "Cancel" : "Edit budget"}
                // Keep focus on the input so its blur (auto-save) doesn't beat this cancel.
                onMouseDown={editing ? (e) => e.preventDefault() : undefined}
                onClick={editing ? cancel : startEdit}
              >
                <IconSwap
                  active={editing}
                  defaultIcon={<Pencil className="size-3.5" />}
                  activeIcon={<X className="size-4" />}
                />
              </Button>
            )}
          </div>
        </div>

        <BudgetStats summary={summary} />
      </CardContent>
    </Card>
  );
};

export default BudgetSummary;
