import type { FC } from "react";
import { motion, type Variants } from "framer-motion";

interface FooterProps {
  fadeUp: (delay: number, y?: number, duration?: number) => Variants;
  fadeIn: (delay: number, duration?: number) => Variants;
  groom_name?: string | null;
  bride_name?: string | null;
  footer_tagline?: string | null;
}

const Footer: FC<FooterProps> = ({
  fadeIn,
  fadeUp,
  groom_name,
  bride_name,
  footer_tagline,
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      className="mt-12 text-center relative"
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
        className="w-10 h-px bg-primary/30 mx-auto mb-6"
      />
      <motion.p
        variants={fadeUp(0.1, 12, 0.7)}
        className="mb-3 italic text-foreground"
      >
        {footer_tagline}
      </motion.p>
      <motion.h2
        variants={fadeUp(0.2, 16, 0.8)}
        className="um-couple-names text-[#66383b] italic tracking-wide leading-tight text-4xl flex flex-col"
      >
        <span>{groom_name}</span>
        <span>&</span>
        <span>{bride_name}</span>
      </motion.h2>
      <motion.div variants={fadeIn(0.35, 1)} className="-mt-8 mb-4">
        <img
          className="w-full max-w-[260px] aspect-square object-contain mx-auto"
          src="/images/unique-muslim/dannad.png"
          alt="Hitchy Stitchy"
        />
      </motion.div>
    </motion.div>
  );
};

export default Footer;
