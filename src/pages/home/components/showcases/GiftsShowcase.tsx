import { useState, useEffect } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import DataTable, {
  type DataTableColumn,
} from "@/components/custom/tables/data-table";
import DataTableTotalRow from "@/components/custom/tables/data-table-total-row";
import { formatSGD } from "@/lib/money";
import GiftRow, { ROW_COLS } from "@/pages/admin/gifts/components/GiftRow";
import type { Gift } from "@/pages/admin/gifts/types";

// The real Gift Envelopes table (DataTable + GiftRow), fed sample SG ang bao /
// sampul duit. Recent envelopes stay put (newest first, like the real sort) so
// no row churn → fixed height; the live element is the "Collected today" tally.
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

// Newest first — auspicious 8s like real ang bao.
const RECENT: Gift[] = [
  mk("g1", "The Tan Family", 688, "envelope"),
  mk("g2", "Wei Jie & Hui Ling", 388, "transfer"),
  mk("g3", "Nurul & Faiz", 168, "transfer"),
  mk("g4", "Uncle Raj", 188, "cash"),
  mk("g5", "Pak Cik Rahman", 288, "envelope"),
  mk("g6", "Cousin Mei", 388, "transfer"),
  mk("g7", "Aunty Lim", 288, "envelope"),
  mk("g8", "Mr & Mrs Goh", 388, "others"),
];

const COLUMNS: DataTableColumn[] = [
  { label: "From" },
  { label: "Received as" },
  { label: "Amount", align: "right" },
];

const TOTALS = [6280, 7168, 8056, 8944, 9888];

function CollectedTotal({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => formatSGD(v));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}

export function GiftsShowcase() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const advance = (s: number) => {
      const last = s >= TOTALS.length - 1;
      timeout = setTimeout(
        () => {
          const next = last ? 0 : s + 1;
          setStep(next);
          advance(next);
        },
        last ? 2600 : 1500,
      );
    };
    advance(step);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DataTable
      colsClass={ROW_COLS}
      columns={COLUMNS}
      footer={
        <DataTableTotalRow>
          <span className="text-xs">
            Collected today{" "}
            <span className="font-medium text-muted-foreground">· Day 1</span>
          </span>
          <span />
          <div className="text-right font-display text-sm font-bold tabular-nums">
            <CollectedTotal value={TOTALS[step]} />
          </div>
        </DataTableTotalRow>
      }
    >
      {RECENT.map((gift) => (
        <GiftRow key={gift.id} gift={gift} onClick={() => {}} />
      ))}
    </DataTable>
  );
}
