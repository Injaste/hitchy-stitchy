import type { FC } from "react"

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/tables/data-table"
import DataTableTotalRow from "@/components/custom/tables/data-table-total-row"
import { formatSGD } from "@/lib/money"

import GiftRow, { ROW_COLS } from "./GiftRow"
import type { Gift } from "../types"

const COLUMNS: DataTableColumn[] = [
  { label: "From" },
  { label: "Received as" },
  { label: "Amount", align: "right" },
]

interface GiftsSheetProps {
  gifts: Gift[]
  total: number
  onRowClick: (gift: Gift) => void
}

const GiftsSheet: FC<GiftsSheetProps> = ({ gifts, total, onRowClick }) => (
  <DataTable
    fill
    virtualizeThreshold={200}
    colsClass={ROW_COLS}
    columns={COLUMNS}
    isEmpty={gifts.length === 0}
    emptyMessage="No gifts match your search."
    items={gifts}
    getRowId={(gift) => gift.id}
    renderRow={(gift) => <GiftRow key={gift.id} gift={gift} onClick={onRowClick} />}
    footer={
      <DataTableTotalRow>
        <span className="text-xs">
          Total{" "}
          <span className="font-medium text-muted-foreground">
            · {gifts.length} {gifts.length === 1 ? "result" : "results"}
          </span>
        </span>
        <span />
        <div className="text-right">
          <div className="font-display text-sm tabular-nums">
            {formatSGD(total)}
          </div>
        </div>
      </DataTableTotalRow>
    }
  />
)

export default GiftsSheet
