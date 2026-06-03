import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { staggerContainer, statItem } from "../animations";
import { stats } from "../data";

function parseStatValue(value: string): { num: number; suffix: string } {
  const match = value.replace(/,/g, "").match(/^(\d+)(.*)$/);
  if (!match) return { num: 0, suffix: value };
  return { num: parseInt(match[1], 10), suffix: match[2] };
}

function StatCounter({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const { num, suffix } = parseStatValue(value);

  const count = useMotionValue(0);
  const display = useTransform(
    count,
    (v) => Math.round(v).toLocaleString() + suffix,
  );

  useEffect(() => {
    if (inView) {
      animate(count, num, { type: "spring", stiffness: 50, damping: 20 });
    }
  }, [inView, num, count]);

  return (
    <motion.div
      ref={ref}
      variants={statItem}
      className="flex flex-col items-center text-center sm:px-8 gap-2"
    >
      <motion.span className="font-display font-bold text-4xl md:text-5xl text-primary">
        {display}
      </motion.span>
      <span className="text-sm text-muted-foreground tracking-wide">
        {label}
      </span>
    </motion.div>
  );
}

export function Stats() {
  return (
    <section className="bg-muted/20 py-16 px-6 md:px-12">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10"
      >
        {stats.map((s) => (
          <StatCounter key={s.label} value={s.value} label={s.label} />
        ))}
      </motion.div>
    </section>
  );
}
