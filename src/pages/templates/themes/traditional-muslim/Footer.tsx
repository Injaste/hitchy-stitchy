import type { FC } from "react";
import { motion, type Variants } from "framer-motion";

interface FooterProps {
  fadeUp: (delay: number, y?: number, duration?: number) => Variants;
  fadeIn: (delay: number, duration?: number) => Variants;
  groom_name?: string | null;
  bride_name?: string | null;
}

const Footer: FC<FooterProps> = ({
  fadeIn,
  fadeUp,
  groom_name,
  bride_name,
}) => {
  const year = new Date().getFullYear();
  const displayName =
    !groom_name && !bride_name
      ? "Our Wedding"
      : `${groom_name} & ${bride_name}`;

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      className="mt-12 sm:mt-16 text-center relative"
    >
      <motion.div
        variants={fadeIn(0)}
        className="flex items-center justify-center gap-3 mb-6"
      >
        <div className="h-px flex-1 max-w-12 bg-primary/40" />
        <span className="text-primary text-xl">✦</span>
        <div className="h-px flex-1 max-w-12 bg-primary/40" />
      </motion.div>
      <motion.p
        variants={fadeUp(0.1, 12, 0.7)}
        className="mb-3 sm:mb-4 text-muted-foreground text-sm sm:text-base font-display tracking-wide"
      >
        With prayers and blessings,
      </motion.p>
      <motion.h2
        variants={fadeUp(0.2, 16, 0.8)}
        className="font-bold text-primary [text-shadow:2px_2px_0_rgba(212,175,55,0.4)] text-2xl sm:text-3xl uppercase tracking-wide font-display"
      >
        {displayName}
      </motion.h2>
      <motion.p
        variants={fadeIn(0.5, 0.8)}
        className="mt-8 text-muted-foreground/60 text-2xs uppercase tracking-[0.4em] font-display"
      >
        © {year} {displayName}
      </motion.p>
    </motion.div>
  );
};

export default Footer;
