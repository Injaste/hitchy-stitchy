import { motion } from "framer-motion";
import { steps } from "../data";

export function HowItWorks() {
  return (
    <section className="py-28 px-6 md:px-12 bg-muted/40 border-y border-border">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs uppercase tracking-widest text-primary font-medium mb-3"
          >
            Simple by design
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-bold text-4xl md:text-5xl text-foreground"
          >
            Up and running in minutes
          </motion.h2>
        </div>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: i % 2 === 0 ? -32 : 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-8 items-start py-10 border-b border-border last:border-0"
            >
              <div className="shrink-0 w-14 h-14 rounded-full border-2 border-primary/30 bg-primary/5 flex items-center justify-center">
                <span className="font-serif font-bold text-primary text-lg">{step.number}</span>
              </div>
              <div className="pt-1">
                <h3 className="font-semibold text-foreground text-lg mb-1.5">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
