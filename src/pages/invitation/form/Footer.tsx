import type { FC } from "react";
import { motion, type Variants } from "framer-motion";

interface FooterProps {
  fadeUp: (delay: number, y?: number, duration?: number) => Variants;
  fadeIn: (delay: number, duration?: number) => Variants;
  groomName?: string;
  brideName?: string;
}

const Footer: FC<FooterProps> = ({ fadeIn, fadeUp, groomName = "Danish", brideName = "Nadhirah" }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      className="mt-12 sm:mt-16 text-center relative"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, scaleX: 0 },
          show: {
            opacity: 1,
            scaleX: 1,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
          },
        }}
        style={{ originX: "50%" }}
        className="w-10 sm:w-12 h-px bg-primary/30 mx-auto mb-6 sm:mb-8"
      />
      <motion.p
        variants={fadeUp(0.1, 12, 0.7)}
        className="mb-3 sm:mb-4 italic text-muted-foreground text-sm sm:text-base font-serif"
      >
        With love and prayers,
      </motion.p>
      <motion.h2
        variants={fadeUp(0.2, 16, 0.8)}
        className="font-bold text-primary-foreground [text-shadow:2px_2px_0_#d4af37,-2px_-2px_0_#d4af37,2px_-2px_0_#d4af37,-2px_2px_0_#d4af37] text-2xl sm:text-3xl italic font-serif"
      >
        {groomName} & {brideName}
      </motion.h2>
      <motion.div variants={fadeIn(0.35, 1)} className="-mt-8 sm:-mt-10 mb-4">
        <img
          className="w-full max-w-[260px] sm:max-w-sm aspect-square object-contain mx-auto"
          src="/dannad.png"
          alt="dannad"
        />
      </motion.div>
      <motion.p
        variants={fadeIn(0.5, 0.8)}
        className="text-muted-foreground/60 text-[10px] uppercase tracking-[0.3em]"
      >
        © 2026 Dannad Wedding
      </motion.p>
    </motion.div>
  );
};

export default Footer;
