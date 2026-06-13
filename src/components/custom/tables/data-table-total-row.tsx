import type { FC, ReactNode } from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

import { useDataTableGrid } from "./data-table"

interface DataTableTotalRowProps {
  /** Cells laid out on the shared column grid (label, spacers, amount…). */
  children: ReactNode
}

const DataTableTotalRow: FC<DataTableTotalRowProps> = ({ children }) => {
  const cols = useDataTableGrid()

  return (
    <motion.div
      layout
      className={cn(
        "grid items-center gap-x-2 border-t-2 border-foreground/80 bg-muted py-3 pr-3 pl-4 font-bold",
        cols,
      )}
    >
      {children}
    </motion.div>
  )
}

export default DataTableTotalRow
