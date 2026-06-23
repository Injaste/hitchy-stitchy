import { motion } from "framer-motion";
import { steps } from "../data";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6 md:px-12 bg-muted/20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
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
            className="font-bold text-4xl md:text-5xl text-foreground"
          >
            Up and running in minutes
          </motion.h2>
        </div>

        <div>
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex gap-8 items-stretch"
              >
                {/* Number + connector line linking the steps */}
                <div className="flex shrink-0 flex-col items-center">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/30 bg-card">
                    <span className="font-display font-bold text-primary text-lg">
                      {step.number}
                    </span>
                  </div>
                  {!isLast && <div className="mt-2 w-px grow bg-primary/20" />}
                </div>
                <div className={`pt-2.5 ${isLast ? "pb-2" : "pb-12"}`}>
                  <h3 className="font-semibold text-foreground text-xl mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-prose">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
