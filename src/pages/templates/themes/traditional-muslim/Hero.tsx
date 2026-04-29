import { motion, type Variants } from "framer-motion";
import CountdownTimer from "@/components/custom/countdown-timer";
import type { PublicEventConfig } from "@/pages/templates/types";

const T = {
  greeting: 0.2,
  ornament: 0.6,
  divider: 0.8,
  name1: 1.1,
  amp: 1.5,
  name2: 1.7,
  countdown: 2.4,
  verse: 2.8,
  cta: 3,
};

const make = (delay: number, y = 20, duration = 0.7): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
  },
});

const greeting: Variants = make(T.greeting, 16, 0.9);
const ornament: Variants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -15 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.9, delay: T.ornament, ease: [0.16, 1, 0.3, 1] },
  },
};
const divider: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  show: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.6, delay: T.divider, ease: [0.16, 1, 0.3, 1] },
  },
};
const name1: Variants = make(T.name1, 40, 1.1);
const amp: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.7, delay: T.amp, ease: "easeOut" },
  },
};
const name2: Variants = make(T.name2, 40, 1.1);
const countdown: Variants = make(T.countdown, 20, 0.8);
const verse: Variants = make(T.verse, 16, 0.8);
const cta: Variants = make(T.cta, 12, 0.7);

const GeometricStar = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-20 h-20 sm:w-24 sm:h-24 mx-auto text-primary"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
  >
    <polygon points="50,5 61,38 95,38 67,58 78,92 50,72 22,92 33,58 5,38 39,38" />
    <polygon
      points="50,15 58,40 84,40 63,55 71,80 50,66 29,80 37,55 16,40 42,40"
      opacity="0.6"
    />
    <circle cx="50" cy="50" r="6" fill="currentColor" />
  </svg>
);

const Hero = ({ eventConfig }: { eventConfig: PublicEventConfig }) => {
  const appearance = eventConfig.config.appearance;

  const greetingText = appearance?.greeting ?? "";
  const quoteText = appearance?.quote ?? "";
  const quoteSource = appearance?.quote_source ?? "";

  const personName1 = eventConfig.groom_name ?? "";
  const personName2 = eventConfig.bride_name ?? "";

  const parts = eventConfig.event_date?.split("-").map(Number);
  const weddingDate = parts ? new Date(parts[0], parts[1] - 1, parts[2]) : null;

  return (
    <section className="relative min-h-svh flex flex-col items-center justify-center text-center py-20 sm:py-32 px-4 sm:px-6 overflow-hidden bg-background/20">
      <motion.div
        initial="hidden"
        animate="show"
        className="z-10 w-full max-w-2xl mx-auto"
      >
        <motion.p
          variants={greeting}
          className="text-foreground/80 text-lg sm:text-2xl tracking-[0.2em] mb-10 sm:mb-14 font-display"
        >
          {greetingText}
        </motion.p>

        <motion.div variants={ornament} className="mb-8 sm:mb-10">
          <GeometricStar />
        </motion.div>

        <motion.div
          variants={divider}
          style={{ originX: "50%" }}
          className="flex items-center justify-center gap-5 mb-6"
        >
          <div className="h-px flex-1 max-w-24 bg-linear-to-r from-transparent to-primary/60" />
          <span className="text-3xs uppercase tracking-[0.5em] text-primary whitespace-nowrap font-bold">
            The Wedding of
          </span>
          <div className="h-px flex-1 max-w-24 bg-linear-to-l from-transparent to-primary/60" />
        </motion.div>

        <div className="mb-12 sm:mb-16">
          <motion.h1
            variants={name1}
            className="font-black text-primary [text-shadow:3px_3px_0_rgba(212,175,55,0.4),-1px_-1px_0_rgba(212,175,55,0.6)] tracking-tight leading-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase font-display"
          >
            {personName1}
          </motion.h1>

          <motion.div
            variants={amp}
            className="flex items-center justify-center gap-4 my-3 sm:my-5"
          >
            <div className="h-px flex-1 max-w-12 bg-primary/40" />
            <span className="text-2xl sm:text-3xl font-light tracking-normal text-primary/70 font-display">
              ✦
            </span>
            <div className="h-px flex-1 max-w-12 bg-primary/40" />
          </motion.div>

          <motion.h1
            variants={name2}
            className="font-black text-primary [text-shadow:3px_3px_0_rgba(212,175,55,0.4),-1px_-1px_0_rgba(212,175,55,0.6)] tracking-tight leading-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase font-display"
          >
            {personName2}
          </motion.h1>
        </div>

        {weddingDate && (
          <motion.div variants={countdown} className="mb-12 sm:mb-16">
            <CountdownTimer targetDate={weddingDate} />
          </motion.div>
        )}

        <motion.div variants={verse} className="mb-12 sm:mb-16">
          <div className="border-y-2 border-primary/30 py-6 sm:py-8 px-4">
            <p className="text-foreground leading-relaxed text-base sm:text-lg font-display">
              "{quoteText}"
            </p>
            <span className="block mt-4 text-primary text-xs tracking-[0.3em] uppercase font-bold">
              — {quoteSource} —
            </span>
          </div>
        </motion.div>

        <motion.a
          href="#details"
          variants={cta}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block bg-primary text-primary-foreground px-10 sm:px-14 py-3.5 sm:py-4 rounded-none border-2 border-primary shadow-lg hover:bg-primary/90 transition-colors uppercase tracking-[0.3em] text-xs sm:text-sm font-bold font-display"
        >
          Our Invitation
        </motion.a>
      </motion.div>
    </section>
  );
};

export default Hero;
