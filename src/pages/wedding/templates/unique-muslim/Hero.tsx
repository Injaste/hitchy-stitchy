import { motion, type Variants } from "framer-motion";
import CountdownTimer from "@/components/custom/countdown-timer";
import type { ThemeProps } from "@/pages/wedding/templates/types";

const T = {
  greeting: 0.2,
  divider: 0.7,
  name1: 1.1,
  amp: 1.5,
  name2: 1.7,
  countdown: 2.5,
  verse: 2.8,
};

const make = (delay: number, y = 20, duration = 0.7): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
  },
});

function getWeddingDateTime(
  dateParts: number[] | undefined,
  weddingStartTime: string | null,
) {
  if (!dateParts || !weddingStartTime) return null;

  const [hours, minutes] = weddingStartTime.split(":").map(Number);

  return new Date(
    dateParts[0],
    dateParts[1] - 1,
    dateParts[2],
    hours || 0,
    minutes || 0,
  );
}

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

type HeroProps = ThemeProps & { ready?: boolean };

const Hero = ({ eventConfig, pageConfig, ready = true }: HeroProps) => {
  const config = pageConfig?.slug === "unique-muslim" ? pageConfig : undefined;
  const {
    groom_name,
    bride_name,
    greeting: greetingText,
    hero_divider_label,
    quote,
    quote_source,
  } = config ?? {};

  const dateParts = eventConfig.event_date?.split("-").map(Number);
  const weddingStartTime = eventConfig.event_time_start;
  const weddingDate = getWeddingDateTime(dateParts, weddingStartTime);

  return (
    <section
      id="hero"
      className="relative min-h-svh flex flex-col items-center justify-center text-center py-20 px-4 overflow-hidden bg-white/10"
    >
      <motion.div
        initial="hidden"
        animate={ready ? "show" : "hidden"}
        className="z-10 w-full max-w-2xl mx-auto"
      >
        <motion.p
          variants={greeting}
          className="text-foreground/80 text-lg tracking-wider mb-14 whitespace-pre-line"
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
            {hero_divider_label}
          </span>
          <div className="h-px flex-1 max-w-20 bg-linear-to-l from-transparent to-primary/50" />
        </motion.div>

        <div className="mb-12">
          <motion.h1
            variants={name1}
            className="um-couple-names text-[#66383b] italic tracking-wide leading-tight text-5xl"
          >
            {groom_name}
          </motion.h1>

          <motion.div
            variants={amp}
            className="flex items-center justify-center gap-5 my-2"
          >
            <div className="h-px flex-1 max-w-16 bg-primary/25" />
            <span className="text-xl font-light not-italic tracking-normal text-foreground/40">
              &amp;
            </span>
            <div className="h-px flex-1 max-w-16 bg-primary/25" />
          </motion.div>

          <motion.h1
            variants={name2}
            className="um-couple-names text-[#66383b] italic tracking-wide leading-tight text-5xl"
          >
            {bride_name}
          </motion.h1>
        </div>

        {weddingDate && (
          <motion.div variants={countdown} className="mb-14">
            <CountdownTimer
              targetDate={weddingDate}
              numberClassName="um-countdown-number"
            />
          </motion.div>
        )}

        <motion.div variants={verse} className="mb-14">
          <div className="border-t border-primary/20 pt-6">
            <p className="text-foreground leading-relaxed text-base whitespace-pre-line">
              {quote}
            </p>
            <span className="block mt-3 text-foreground/80 text-xs tracking-widest uppercase font-medium">
              {quote_source}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
