import { motion, type Variants } from "framer-motion";
import CountdownTimer from "@/components/custom/countdown-timer";
import type { PublicEventConfig } from "@/pages/templates/types";
import type { ThemePageConfig } from "@/pages/templates/themes/types";

const T = {
  greeting: 0.2,
  accent: 0.5,
  name1: 0.9,
  amp: 1.3,
  name2: 1.5,
  countdown: 2.1,
  verse: 2.5,
  cta: 2.8,
};

const make = (delay: number, y = 16, duration = 0.7): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
  },
});

const greeting: Variants = make(T.greeting, 12, 0.8);
const accent: Variants = make(T.accent, 8, 0.6);
const name1: Variants = make(T.name1, 24, 1);
const amp: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.6, delay: T.amp, ease: "easeOut" },
  },
};
const name2: Variants = make(T.name2, 24, 1);
const countdown: Variants = make(T.countdown, 16, 0.8);
const verse: Variants = make(T.verse, 12, 0.7);
const cta: Variants = make(T.cta, 8, 0.6);

interface Props {
  eventConfig: PublicEventConfig;
  pageConfig?: ThemePageConfig;
}

const Hero = ({ eventConfig, pageConfig }: Props) => {
  const appearance = eventConfig.config.appearance;
  const config =
    pageConfig?._theme_slug === "minimalistic-muslim" ? pageConfig : undefined;
  const accentLabel = config?.accent_label ?? "";

  const greetingText = appearance?.greeting ?? "";
  const quoteText = appearance?.quote ?? "";
  const quoteSource = appearance?.quote_source ?? "";

  const personName1 = eventConfig.groom_name ?? "";
  const personName2 = eventConfig.bride_name ?? "";

  const parts = eventConfig.event_date?.split("-").map(Number);
  const weddingDate = parts ? new Date(parts[0], parts[1] - 1, parts[2]) : null;

  return (
    <section className="relative min-h-svh flex flex-col items-center justify-center text-center py-20 sm:py-32 px-4 sm:px-6 overflow-hidden bg-background">
      <motion.div
        initial="hidden"
        animate="show"
        className="z-10 w-full max-w-2xl mx-auto"
      >
        <motion.p
          variants={greeting}
          className="text-foreground/60 text-base sm:text-lg tracking-wide mb-16 sm:mb-20"
        >
          {greetingText}
        </motion.p>

        {accentLabel && (
          <motion.p
            variants={accent}
            className="text-3xs sm:text-2xs uppercase tracking-[0.5em] text-muted-foreground mb-6 sm:mb-8"
          >
            {accentLabel}
          </motion.p>
        )}

        <div className="mb-14 sm:mb-20">
          <motion.h1
            variants={name1}
            className="font-light text-foreground tracking-tight leading-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display"
          >
            {personName1}
          </motion.h1>

          <motion.div
            variants={amp}
            className="my-3 sm:my-5"
          >
            <span className="text-xl sm:text-2xl font-light text-foreground/40 font-display">
              &amp;
            </span>
          </motion.div>

          <motion.h1
            variants={name2}
            className="font-light text-foreground tracking-tight leading-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display"
          >
            {personName2}
          </motion.h1>
        </div>

        {weddingDate && (
          <motion.div variants={countdown} className="mb-14 sm:mb-20">
            <CountdownTimer targetDate={weddingDate} />
          </motion.div>
        )}

        <motion.div variants={verse} className="mb-14 sm:mb-20 max-w-md mx-auto">
          <div className="border-t border-foreground/10 pt-6 sm:pt-8">
            <p className="text-foreground/70 leading-relaxed text-sm sm:text-base">
              {quoteText}
            </p>
            <span className="block mt-3 text-muted-foreground text-2xs tracking-[0.25em] uppercase">
              {quoteSource}
            </span>
          </div>
        </motion.div>

        <motion.a
          href="#details"
          variants={cta}
          whileHover={{ opacity: 0.7 }}
          className="inline-block text-foreground border-b border-foreground pb-1 uppercase tracking-[0.3em] text-2xs sm:text-xs"
        >
          Our Invitation
        </motion.a>
      </motion.div>
    </section>
  );
};

export default Hero;
