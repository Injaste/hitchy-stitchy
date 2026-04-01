import { motion } from "framer-motion";
import { staggerContainer, statItem } from "../animations";
import { stats } from "../data";

export function Stats() {
  return (
    <section className="border-y border-border bg-muted/30 py-12 px-6 md:px-12">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0 sm:divide-x sm:divide-border"
      >
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={statItem}
            className="flex flex-col items-center text-center sm:px-12 gap-1"
          >
            <span className="font-serif font-bold text-4xl md:text-5xl text-primary">
              {s.value}
            </span>
            <span className="text-sm text-muted-foreground tracking-wide">
              {s.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
