import { motion, type Variants } from "framer-motion";
import CountdownTimer from "../../components/custom/countdown-timer";
import type { PublicEventConfig } from "./types";

const T = {
  greeting: 0.2,
  divider: 0.7,
  name1: 1.1,
  amp: 1.5,
  name2: 1.7,
  countdown: 2.5,
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

const Hero = ({ eventConfig }: { eventConfig: PublicEventConfig }) => {
  const appearance = eventConfig.config.appearance;

  const greetingText = appearance?.greeting ?? "السلام عليكم ورحمة الله وبركاته";
  const quoteText = appearance?.quote ?? "And We created you in pairs.";
  const quoteSource = appearance?.quote_source ?? "Surah An-Naba 78:8";

  const names = (eventConfig.couple_names ?? "").split("&").map((s) => s.trim());
  const personName1 = names[0] ?? "";
  const personName2 = names[1] ?? "";

  const parts = eventConfig.event_date?.split("-").map(Number);
  const weddingDate = parts ? new Date(parts[0], parts[1] - 1, parts[2]) : null;

  return (
    <section className="relative min-h-svh flex flex-col items-center justify-center text-center py-20 sm:py-32 px-4 sm:px-6 overflow-hidden bg-white/10 backdrop-blur-sm">
      <motion.div
        initial="hidden"
        animate="show"
        className="z-10 w-full max-w-2xl mx-auto"
      >
        <motion.p
          variants={greeting}
          className="text-foreground/80 text-lg sm:text-2xl tracking-wider mb-14 sm:mb-20"
        >
          {greetingText}
        </motion.p>

        <motion.div
          variants={divider}
          style={{ originX: "50%" }}
          className="flex items-center justify-center gap-5 mb-5"
        >
          <div className="h-px flex-1 max-w-20 bg-linear-to-r from-transparent to-primary/50" />
          <span className="text-3xs uppercase tracking-[0.45em] text-muted-foreground whitespace-nowrap">
            The Wedding of
          </span>
          <div className="h-px flex-1 max-w-20 bg-linear-to-l from-transparent to-primary/50" />
        </motion.div>

        <div className="mb-12 sm:mb-16">
          <motion.h1
            variants={name1}
            className="font-black text-primary-foreground [text-shadow:2px_2px_0_#d4af37,-2px_-2px_0_#d4af37,2px_-2px_0_#d4af37,-2px_2px_0_#d4af37] tracking-tighter italic leading-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {personName1}
          </motion.h1>

          <motion.div
            variants={amp}
            className="flex items-center justify-center gap-5 my-2 sm:my-4"
          >
            <div className="h-px flex-1 max-w-16 bg-primary/25" />
            <span className="text-xl sm:text-2xl font-light not-italic tracking-normal text-foreground/40">
              &amp;
            </span>
            <div className="h-px flex-1 max-w-16 bg-primary/25" />
          </motion.div>

          <motion.h1
            variants={name2}
            className="font-black text-primary-foreground [text-shadow:2px_2px_0_#d4af37,-2px_-2px_0_#d4af37,2px_-2px_0_#d4af37,-2px_2px_0_#d4af37] tracking-tighter italic leading-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {personName2}
          </motion.h1>
        </div>

        {weddingDate && (
          <motion.div variants={countdown} className="mb-14 sm:mb-20">
            <CountdownTimer targetDate={weddingDate} />
          </motion.div>
        )}

        <motion.div variants={verse} className="mb-14 sm:mb-20">
          <div className="border-t border-primary/20 pt-6 sm:pt-8">
            <p className="text-foreground leading-relaxed text-base sm:text-lg">
              "{quoteText}"
            </p>
            <span className="block mt-3 text-foreground/80 text-xs tracking-widest uppercase font-medium">
              {quoteSource}
            </span>
          </div>
        </motion.div>

        <motion.a
          href="#details"
          variants={cta}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block bg-primary text-primary-foreground px-8 sm:px-12 py-3.5 sm:py-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors uppercase tracking-widest text-xs sm:text-sm font-bold"
        >
          Our Invitation
        </motion.a>
      </motion.div>
    </section>
  );
};

export default Hero;
