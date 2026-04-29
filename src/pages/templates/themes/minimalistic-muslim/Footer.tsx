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
      className="mt-16 sm:mt-20 text-center"
    >
      <motion.div
        variants={fadeIn(0)}
        className="w-12 h-px bg-foreground/20 mx-auto mb-6"
      />
      <motion.p
        variants={fadeUp(0.1)}
        className="mb-2 text-muted-foreground text-2xs uppercase tracking-[0.3em]"
      >
        With prayers,
      </motion.p>
      <motion.h2
        variants={fadeUp(0.2)}
        className="text-foreground text-lg sm:text-xl font-display font-light mb-8"
      >
        {displayName}
      </motion.h2>
      <motion.p
        variants={fadeIn(0.4)}
        className="text-muted-foreground/60 text-3xs uppercase tracking-[0.4em]"
      >
        © {year}
      </motion.p>
    </motion.div>
  );
};

export default Footer;
