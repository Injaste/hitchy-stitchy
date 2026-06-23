import { useState, useEffect } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import DataTable, {
  type DataTableColumn,
} from "@/components/custom/tables/data-table";
import DataTableTotalRow from "@/components/custom/tables/data-table-total-row";
import { formatSGD } from "@/lib/money";
import GiftRow, { ROW_COLS } from "@/pages/home/features/gifts/GiftRow";
import type { Gift } from "../../features/types";

// The real Gift Envelopes table (DataTable + GiftRow), fed a mix of SG money
// gifts — ang bao (Chinese), sampul duit (Malay), shagun (Indian). Two more
// envelopes arrive (newest first), then clear, looping — DataTable's
// AnimatePresence animates the rows in/out and the "Collected today" total
// recomputes to the live sum. The fixed-height box absorbs the row churn.
const mk = (
  id: string,
  given_by: string,
  amount: number,
  method: Gift["method"],
): Gift => ({
  id,
  event_id: "demo",
  given_by,
  amount,
  method,
  notes: null,
  day_id: "demo",
  created_at: "2026-06-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
});

// The settled base — newest first, a mix across communities, auspicious 8s.
const BASE: Gift[] = [
  mk("g1", "Priya & Karthik", 388, "transfer"),
  mk("g2", "Nurul & Faiz", 168, "transfer"),
  mk("g3", "Uncle Raj", 188, "cash"),
  mk("g4", "Pak Cik Rahman", 288, "envelope"),
  mk("g5", "Aunty Lim", 388, "transfer"),
  mk("g6", "Mr & Mrs Goh", 388, "others"),
];

// The two that arrive during the loop (prepended — newest at the top).
const INCOMING: Gift[] = [
  mk("g7", "The Tan Family", 688, "envelope"),
  mk("g8", "Deepa & Suresh", 288, "cash"),
];

const COLUMNS: DataTableColumn[] = [
  { label: "From" },
  { label: "Received as" },
  { label: "Amount", align: "right" },
];

// How many of INCOMING are present at each step: settle → +1 → +2 → clear.
const STEPS = [0, 1, 2, 0];

function CollectedTotal({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => formatSGD(v));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.7, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}

export function GiftsShowcase() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const advance = (s: number) => {
      const last = s >= STEPS.length - 1;
      timeout = setTimeout(
        () => {
          const next = last ? 0 : s + 1;
          setStep(next);
          advance(next);
        },
        last ? 2400 : 1700,
      );
    };
    advance(step);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const added = INCOMING.slice(0, STEPS[step]);
  const gifts = [...added, ...BASE]; // newest first
  const total = gifts.reduce((sum, g) => sum + g.amount, 0);

  return (
    <DataTable
      colsClass={ROW_COLS}
      columns={COLUMNS}
      footer={
        <DataTableTotalRow>
          <span className="text-xs">
            Collected today{" "}
            <span className="font-medium text-muted-foreground">
              · {gifts.length} gifts
            </span>
          </span>
          <span />
          <div className="text-right font-display text-sm font-bold tabular-nums">
            <CollectedTotal value={total} />
          </div>
        </DataTableTotalRow>
      }
    >
      {gifts.map((gift) => (
        <GiftRow key={gift.id} gift={gift} onClick={() => {}} />
      ))}
    </DataTable>
  );
}
