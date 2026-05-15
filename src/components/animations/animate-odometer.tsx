import type { FC } from "react";
import { motion } from "framer-motion";

interface OdometerDigitProps {
  value: number;
}

const OdometerDigit: FC<OdometerDigitProps> = ({ value }) => {
  const offset = 1.5;
  const inline = 0.45;
  const valueCorrected = value * offset;

  return (
    <div
      style={{
        position: "relative",
        height: `${offset}em`,
        width: `${offset}em`,
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
        isolation: "isolate",
        userSelect: "none",
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

interface OdometerProps {
  value: number;
  pad?: number;
}

const Odometer = ({ value, pad }: OdometerProps) => (
  <span className="inline-flex items-center">
    {String(value)
      .padStart(pad ?? 0, "0")
      .split("")
      .map((d, i) => (
        <OdometerDigit key={i} value={Number(d)} />
      ))}
  </span>
);

export default Odometer;
