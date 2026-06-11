import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface IconSwapProps {
  /** Which icon to show: false → defaultIcon, true → activeIcon. */
  active: boolean;
  defaultIcon: ReactNode;
  activeIcon: ReactNode;
  /**
   * When set, the active state auto-reverts after this many ms by firing
   * onAutoReturn — for transient confirmations like a "copied!" check. Omit for
   * a controlled toggle (e.g. an edit ⇄ cancel button) that stays until changed.
   */
  autoReturnMs?: number;
  onAutoReturn?: () => void;
  className?: string;
}

/**
 * Rotate + scale + fade swap between two icons (the budget inline-edit
 * Pencil⇄X animation, extracted). Controlled via `active`.
 */
const IconSwap = ({
  active,
  defaultIcon,
  activeIcon,
  autoReturnMs,
  onAutoReturn,
  className,
}: IconSwapProps) => {
  // Keep the latest callback without re-arming the timer every render.
  const onAutoReturnRef = useRef(onAutoReturn);
  onAutoReturnRef.current = onAutoReturn;

  useEffect(() => {
    if (!active || !autoReturnMs) return;
    const id = setTimeout(() => onAutoReturnRef.current?.(), autoReturnMs);
    return () => clearTimeout(id);
  }, [active, autoReturnMs]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={active ? "active" : "default"}
        initial={{ opacity: 0, rotate: active ? -90 : 90, scale: 0.5 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: active ? 90 : -90, scale: 0.5 }}
        transition={{ duration: 0.15 }}
        className={className ?? "inline-flex"}
      >
        {active ? activeIcon : defaultIcon}
      </motion.span>
    </AnimatePresence>
  );
};

export default IconSwap;
