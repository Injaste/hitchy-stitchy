import { useLayoutEffect, useRef, useState, type FC } from "react";
import { motion } from "framer-motion";

interface OdometerDigitProps {
  value: number;
  /** Row height snapped to whole device pixels — digits translate by a multiple
   *  of it so the resting position always lands on the physical pixel grid.
   *  null until measured (pre-paint only; never visible). */
  unit: number | null;
}

const OdometerDigit: FC<OdometerDigitProps> = ({ value, unit }) => {
  const offset = 1.5;
  const inline = 0.45;
  // In px once measured, em as a pre-paint fallback. Snapping height and the
  // translate to the same whole-pixel unit keeps every digit grid-aligned;
  // an em translate lands mid-pixel for some values and renders crooked.
  const cellHeight = unit != null ? `${unit}px` : `${offset}em`;
  // Multiples of the device-snapped unit stay on the physical pixel grid; an em
  // translate lands mid-pixel for some values and renders crooked (worse at
  // fractional devicePixelRatio, where even a whole-CSS-px unit drifts).
  const shift = unit != null ? `-${value * unit}px` : `-${value * offset}em`;

  return (
    <div
      style={{
        position: "relative",
        height: cellHeight,
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
        animate={{ y: shift }}
        transition={{ type: "spring", stiffness: 180, damping: 30 }}
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
              transition={{ type: "spring", stiffness: 180, damping: 30 }}
              style={{
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                height: cellHeight,
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
  /** Static text rendered before the digits (e.g. a currency symbol). */
  prefix?: string;
  /** Group with thousands separators (commas render static; digits still roll). */
  group?: boolean;
}

const Odometer = ({ value, pad, prefix, group }: OdometerProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [unit, setUnit] = useState<number | null>(null);

  // Row height ≈ 1.5 × font-size, snapped so it spans a whole number of *device*
  // pixels. Measured from the computed font-size (which the digits inherit) so
  // it tracks every size the Odometer is used at; re-measured on layout resize
  // and on window resize (which fires when zoom changes devicePixelRatio).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const fontSize = parseFloat(getComputedStyle(el).fontSize);
      const dpr = window.devicePixelRatio || 1;
      setUnit(fontSize ? Math.round(fontSize * 1.5 * dpr) / dpr : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const base = group
    ? Math.round(value).toLocaleString("en-US")
    : String(value);
  const chars = (pad ? base.padStart(pad, "0") : base).split("");

  return (
    <span ref={ref} className="inline-flex items-center">
      {prefix && (
        <span className="inline-flex items-center" style={{ marginRight: "0.05em" }}>
          {prefix}
        </span>
      )}
      {chars.map((ch, i) =>
        /\d/.test(ch) ? (
          <OdometerDigit key={i} value={Number(ch)} unit={unit} />
        ) : (
          <span
            key={i}
            className="inline-flex items-center justify-center"
            style={{ height: unit != null ? `${unit}px` : "1.5em" }}
          >
            {ch}
          </span>
        ),
      )}
    </span>
  );
};

export default Odometer;
