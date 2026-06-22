import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Mail, Banknote, Send, Coins, type LucideIcon } from "lucide-react";
import { formatSGD } from "@/lib/money";

// How a gift arrived — mirrors the real Gift Envelopes feature (ang bao /
// sampul duit / shagun ledger). Icon + label only; no per-method colour.
const METHOD: Record<string, { label: string; icon: LucideIcon }> = {
  envelope: { label: "Envelope", icon: Mail },
  cash: { label: "Cash", icon: Banknote },
  transfer: { label: "PayNow", icon: Send },
  others: { label: "Others", icon: Coins },
};

// Arrival order, oldest first. Auspicious amounts (lots of 8s) like real ang bao.
const GIFTS = [
  { id: "g0", given_by: "Aunty Lim", method: "envelope", amount: 288 },
  { id: "g1", given_by: "Uncle Raj", method: "cash", amount: 200 },
  { id: "g2", given_by: "Wei Jie & Mei", method: "transfer", amount: 388 },
  { id: "g3", given_by: "The Tan Family", method: "envelope", amount: 500 },
  { id: "g4", given_by: "Siti & Faiz", method: "transfer", amount: 168 },
  { id: "g5", given_by: "Priya & Arjun", method: "envelope", amount: 888 },
  { id: "g6", given_by: "Mr Goh", method: "others", amount: 388 },
];

const START = 3; // always show >=3 rows so the list height never changes
const VISIBLE = 3;

function AnimatedTotal({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => formatSGD(v));
  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}

export function GiftsMock() {
  // n = how many gifts have arrived. Climbs, then loops back to START. The list
  // always renders exactly VISIBLE rows (newest first), so its height is fixed;
  // new envelopes slide in at the top while the oldest pops out of flow.
  const [n, setN] = useState(START);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const advance = (current: number) => {
      const atEnd = current >= GIFTS.length;
      timeout = setTimeout(
        () => {
          const next = atEnd ? START : current + 1;
          setN(next);
          advance(next);
        },
        atEnd ? 2600 : 1900,
      );
    };
    advance(n);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const arrived = GIFTS.slice(0, n);
  const visible = arrived.slice(-VISIBLE).reverse(); // newest first
  const total = arrived.reduce((s, g) => s + g.amount, 0);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden select-none">
      {/* Chrome */}
      <div className="bg-muted/60 border-b border-border px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
        </div>
        <span className="text-xs text-muted-foreground font-medium mx-auto">
          Gift Envelopes · Day 1
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Running tally */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Collected so far</p>
            <p className="font-display text-2xl font-bold text-foreground tabular-nums">
              <AnimatedTotal value={total} />
            </p>
          </div>
          <span className="text-xs text-muted-foreground pb-1 tabular-nums">
            {n} envelopes
          </span>
        </div>

        {/* Ledger — exactly VISIBLE rows; height fixed. */}
        <div className="space-y-2">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((g) => {
              const meta = METHOD[g.method];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={g.id}
                  layout
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
                >
                  <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center text-primary">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {g.given_by}
                    </p>
                    <p className="text-xs text-muted-foreground">{meta.label}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-foreground tabular-nums">
                    {formatSGD(g.amount)}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
