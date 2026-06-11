import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FC } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Odometer from "@/components/animations/animate-odometer";
import IconSwap from "@/components/animations/animate-icon-swap";
import { cn } from "@/lib/utils";

import { useBudgetMutations } from "../queries";
import {
  formatNum,
  formatSGD,
  type BudgetSummary as SummaryData,
} from "../utils";

type Tone = "good" | "warn" | "bad";

const Stat: FC<{ k: string; value: number | null; tone?: Tone }> = ({
  k,
  value,
  tone,
}) => (
  <div className="min-w-0">
    <div className="text-2xs font-medium text-muted-foreground">{k}</div>
    <div
      className={cn(
        "mt-0.5 font-display text-sm font-bold tabular-nums whitespace-nowrap",
        tone === "good" && "text-success",
        tone === "warn" && "text-warning",
        tone === "bad" && "text-destructive",
      )}
    >
      {value === null ? "—" : <Odometer value={value} prefix="S$" group />}
    </div>
  </div>
);

interface BudgetSummaryProps {
  summary: SummaryData;
}

const BudgetSummary: FC<BudgetSummaryProps> = ({ summary }) => {
  const { update } = useBudgetMutations();
  const {
    budgetTotal,
    spent,
    paid,
    remaining,
    outstanding,
    dueSoon,
    spentPct,
    paidPct,
  } = summary;
  const over = remaining !== null && remaining < 0;

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
            Total budget
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
              <button
                type="button"
                onClick={startEdit}
                className="cursor-pointer font-display text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Set a budget
              </button>
            )}

            {(editing || budgetTotal !== null) && (
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

        {budgetTotal !== null && (
          <>
            <div className="relative mt-3 mb-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary/35 transition-[width] duration-500 ease-out"
                style={{ width: `${spentPct * 100}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${paidPct * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Spent {Math.round(spentPct * 100)}% of budget</span>
              <span className={cn(over && "font-medium text-destructive")}>
                {over
                  ? `${formatSGD(Math.abs(remaining!))} over`
                  : `${formatSGD(remaining ?? 0)} left`}
              </span>
            </div>
          </>
        )}

        {dueSoon > 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning">
            <AlertTriangle className="size-3.5" />
            {formatSGD(dueSoon)} due now or within 2 weeks
          </div>
        )}

        <Separator className="mt-3.5" />
        <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat k="Spent" value={spent} />
          <Stat k="Paid" value={paid} />
          <Stat
            k="Remaining"
            value={remaining}
            tone={remaining === null ? undefined : over ? "bad" : "good"}
          />
          <Stat
            k="Outstanding"
            value={outstanding}
            tone={outstanding > 0 ? "warn" : undefined}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetSummary;
