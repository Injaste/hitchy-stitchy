import type { FC } from "react";

import NotesTooltip from "@/components/custom/notes-tooltip";
import DataTableRow from "@/components/custom/tables/data-table-row";
import { formatSGD } from "@/lib/money";
import { METHOD_META } from "@/pages/admin/gifts/utils";
import type { Gift } from "@/pages/admin/gifts/types";

export const ROW_COLS = "grid-cols-[minmax(0,1fr)_5rem_5rem]";

interface GiftRowProps {
  gift: Gift;
  onClick: (gift: Gift) => void;
}

const GiftRow: FC<GiftRowProps> = ({ gift, onClick }) => {
  const method = METHOD_META[gift.method];
  const MethodIcon = method.icon;

  return (
    <DataTableRow onClick={() => onClick(gift)} contentClassName="py-3">
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
    </DataTableRow>
  );
};

export default GiftRow;
