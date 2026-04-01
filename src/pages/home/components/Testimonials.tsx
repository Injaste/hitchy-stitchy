import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { dividerLine } from "../animations";
import { testimonials } from "../data";

// Duplicate for seamless loop
const ITEMS = [...testimonials, ...testimonials];

function TestimonialCard({ quote, names, event }: { quote: string; names: string; event: string }) {
  return (
    <div className="shrink-0 w-80 md:w-96 bg-card rounded-2xl border border-border p-7 shadow-sm flex flex-col gap-5">
      {/* Hearts */}
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Heart key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
        ))}
      </div>

      {/* Quote mark */}
      <span className="font-serif text-5xl leading-none text-primary/20 -mt-1 select-none">"</span>

      {/* Quote */}
      <p className="text-foreground/80 leading-relaxed text-sm -mt-6 flex-1">{quote}</p>

      {/* Attribution */}
      <div className="border-t border-border pt-4">
        <p className="font-serif font-semibold text-foreground text-sm">{names}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{event}</p>
      </div>
    </div>
  );
}

export function Testimonials() {
  const [paused, setPaused] = useState(false);

  return (
    <section className="py-28 bg-muted/20 overflow-hidden">
      <div className="px-6 md:px-12 max-w-6xl mx-auto mb-14">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs uppercase tracking-widest text-primary font-medium mb-3"
          >
            Loved by couples
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-bold text-4xl md:text-5xl text-foreground"
          >
            Stories worth celebrating
          </motion.h2>
          <motion.div
            variants={dividerLine}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-6 mx-auto h-px w-24 bg-primary/30 origin-center"
          />
        </div>
      </div>

      {/* Marquee track */}
      <>
        <style>{`
          @keyframes hs-marquee {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>

        <div
          className="overflow-hidden cursor-default"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Fade edges */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-muted/20 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-muted/20 to-transparent z-10 pointer-events-none" />

            <div
              className="flex gap-5 pb-4"
              style={{
                animation: "hs-marquee 38s linear infinite",
                animationPlayState: paused ? "paused" : "running",
                width: "max-content",
              }}
            >
              {ITEMS.map((t, i) => (
                <TestimonialCard key={i} {...t} />
              ))}
            </div>
          </div>
        </div>
      </>
    </section>
  );
}
