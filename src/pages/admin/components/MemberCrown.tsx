import type { FC } from "react";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberCrownProps {
  isBride: boolean;
  isGroom: boolean;
  /** Extra classes — use to adjust size/position for different avatar sizes. */
  className?: string;
}

/** Absolutely-positioned couple crown. Drop inside any `relative` container.
 *  Bride → rose; Groom → amber. Renders nothing if neither role is set. */
const MemberCrown: FC<MemberCrownProps> = ({ isBride, isGroom, className }) => {
  if (!isBride && !isGroom) return null;
  return (
    <Crown
      aria-hidden
      className={cn(
        "pointer-events-none absolute -rotate-35 drop-shadow-sm transition-all",
        isBride
          ? "fill-rose-400 text-rose-500"
          : "fill-amber-400 text-amber-500",
        className,
      )}
    />
  );
};

export default MemberCrown;
