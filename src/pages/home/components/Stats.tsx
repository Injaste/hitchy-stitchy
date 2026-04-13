import { motion } from "framer-motion";
import { staggerContainer, statItem } from "../animations";
import { stats } from "../data";

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
          <motion.div
            key={s.label}
            variants={statItem}
            className="flex flex-col items-center text-center sm:px-8 gap-2"
          >
            <span className="font-display font-bold text-4xl md:text-5xl text-primary">
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
