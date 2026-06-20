import { useState, type ComponentProps, type FC, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { widthReveal } from "@/lib/animations";

type ButtonProps = ComponentProps<typeof Button>;

interface AdaptiveButtonProps {
  /** True → the trigger opens `menu`; false → a click runs `onClick` (plain button). */
  asMenu: boolean;
  /** Direct action, used only while `asMenu` is false. */
  onClick?: () => void;
  /** Dropdown body (DropdownMenuItems); rendered only while `asMenu`. */
  menu?: ReactNode;
  /** Trigger content — icon + label. */
  children: ReactNode;
  /** Drop the reveal chevron, e.g. for icon-only triggers. */
  hideChevron?: boolean;
  /** Forwarded to DropdownMenuContent. */
  align?: "start" | "center" | "end";
  contentClassName?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

/**
 * A button that collapses to a single action or expands into a dropdown, driven
 * by `asMenu`. The trigger stays mounted across the flip so the chevron can
 * reveal / collapse via `widthReveal`, and so a not-a-menu click fires `onClick`
 * directly while the menu is held closed. Extracted from the guests export
 * control; reuse wherever a control has one action sometimes and several others.
 */
const AdaptiveButton: FC<AdaptiveButtonProps> = ({
  asMenu,
  onClick,
  menu,
  children,
  hideChevron = false,
  align = "end",
  contentClassName,
  variant = "outline",
  size = "sm",
  className,
  disabled,
  "aria-label": ariaLabel,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu
      open={asMenu && open}
      // Only a menu has open state; ignore Radix's requests otherwise so a
      // plain-button click can't leave `open` stuck true (which would pop the
      // menu the moment the control turns into one).
      onOpenChange={(next) => {
        if (asMenu) setOpen(next);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={disabled}
          aria-label={ariaLabel}
          onClick={asMenu ? undefined : onClick}
        >
          {children}
          {!hideChevron && (
            <AnimatePresence initial={false}>
              {asMenu && (
                <motion.span
                  key="chevron"
                  variants={widthReveal}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="inline-flex overflow-hidden"
                >
                  <ChevronDown className="size-3 opacity-60" />
                </motion.span>
              )}
            </AnimatePresence>
          )}
        </Button>
      </DropdownMenuTrigger>
      {asMenu && (
        <DropdownMenuContent align={align} className={contentClassName}>
          {menu}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default AdaptiveButton;
