import type { FC } from "react";
import { motion } from "framer-motion";

interface OdometerDigitProps {
  value: number;
  className?: string;
}

const OdometerDigit: FC<OdometerDigitProps> = ({ value, className }) => {
  const offset = 1.5;
  const inline = 0.45;
  const valueCorrected = value * offset;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        height: `${offset}em`,
        width: `${offset}em`,

        // Instead of overflow:hidden, use a CSS mask to fade the top/bottom edges.
        // This lets blur render beyond the clip boundary without a hard cut.
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",

        // Contain the blur within this digit so it doesn't bleed into siblings.
        isolation: "isolate",

        paddingInline: `${inline}em`,
        marginInline: `-${inline}em`,
      }}
    >
      <motion.div
        initial={false}
        animate={{ y: `-${valueCorrected}em` }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        style={{ display: "flex", flexDirection: "column" }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const isActive = num === value;

          return (
            <motion.span
              key={num}
              animate={
                isActive
                  ? { opacity: 1, filter: "blur(0px)" }
                  : { opacity: 0.4, filter: "blur(6px)" }
              }
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              style={{
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                height: `${offset}em`,
                // Contain each digit's blur within its own stacking context
                // so blur from num=3 can't visually merge with num=4.
                willChange: "filter",
              }}
            >
              {num}
            </motion.span>
          );
        })}
      </motion.div>
    </div>
  );
};

export default OdometerDigit;
