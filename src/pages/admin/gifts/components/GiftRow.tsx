import type { FC } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { listItemReveal, listLayoutTransition } from "@/lib/animations";
import NotesTooltip from "@/components/custom/notes-tooltip";

import { formatSGD } from "@/lib/money";
import { METHOD_META } from "../utils";
import type { Gift } from "../types";

/** Shared sheet column template — header, rows, and grand total stay in sync.
 *  From · Received-as · Amount. */
export const ROW_COLS = "grid-cols-[minmax(0,1fr)_6rem_5.5rem]";

interface GiftRowProps {
  gift: Gift;
  onClick: (gift: Gift) => void;
}

const GiftRow: FC<GiftRowProps> = ({ gift, onClick }) => {
  const method = METHOD_META[gift.method];
  const MethodIcon = method.icon;

  return (
    <motion.button
      type="button"
      layout="position"
      variants={listItemReveal}
      initial="hidden"
      animate="show"
      exit="exit"
      transition={listLayoutTransition}
      onClick={() => onClick(gift)}
      className="relative block w-full cursor-pointer overflow-hidden border-b border-border text-left transition-colors last:border-b-0 hover:bg-accent/40"
    >
      {/* Padding here, not on the button, so the height tween can collapse the
          row fully to 0 on exit instead of leaving a padding stub. */}
      <div className={cn("grid items-center gap-x-2 py-3 pr-3 pl-4", ROW_COLS)}>
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-sm font-semibold">{gift.given_by}</span>
          <NotesTooltip notes={gift.notes} />
        </div>

        <div className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <MethodIcon className="size-3 shrink-0" />
          <span className="truncate">{method.label}</span>
        </div>

        <div className="text-right font-display text-sm font-bold tabular-nums">
          {formatSGD(gift.amount)}
        </div>
      </div>
    </motion.button>
  );
};

export default GiftRow;
