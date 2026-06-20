import { cn } from "@/lib/utils";

interface AnimatedCheckProps {
  checked: boolean;
  className?: string;
}

/** The checkmark from our Checkbox, drawn via stroke-dashoffset — extracted so it
 *  can animate anywhere (e.g. the password checklist). Draws in when `checked`,
 *  retracts when not. Inherits color from `currentColor`. */
const AnimatedCheck = ({ checked, className }: AnimatedCheckProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3.5}
    className={cn("size-2.5", className)}
  >
    <path
      data-checked={checked}
      d="M4.5 12.75l6 6 9-13.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="[stroke-dasharray:26] [stroke-dashoffset:26] transition-[stroke-dashoffset] duration-300 ease-out data-[checked=true]:[stroke-dashoffset:0]"
    />
  </svg>
);

export default AnimatedCheck;
