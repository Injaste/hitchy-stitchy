import type { FC } from "react";
import { ChevronDown, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Guest } from "../types";
import { exportGuestsCSV } from "../utils";

interface GuestsExportProps {
  /** The currently filtered (visible) guests. */
  visible: Guest[];
  /** Guests the user has explicitly checked, across the whole list. */
  selected: Guest[];
}

/**
 * Context-aware CSV export. An explicit selection wins and exports verbatim;
 * otherwise it exports the visible set, offering an "exclude cancelled" choice
 * only when the visible set actually contains cancelled guests.
 */
const GuestsExport: FC<GuestsExportProps> = ({ visible, selected }) => {
  // Explicit selection — export exactly what was picked, no menu.
  if (selected.length > 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-xs"
        onClick={() => exportGuestsCSV(selected)}
      >
        <Download className="w-3.5 h-3.5" />
        Export {selected.length} selected
      </Button>
    );
  }

  const withoutCancelled = visible.filter((g) => g.status !== "cancelled");
  // Only offer the exclude option when the view is a genuine mix — an
  // all-confirmed or all-cancelled view has nothing meaningful to strip.
  const isMixed =
    withoutCancelled.length > 0 && withoutCancelled.length < visible.length;

  // Nothing to choose between — a single plain action is enough.
  if (!isMixed) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-xs"
        disabled={visible.length === 0}
        onClick={() => exportGuestsCSV(visible)}
      >
        <Download className="w-3.5 h-3.5" />
        Export
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={visible.length === 0}
        >
          <Download className="w-3.5 h-3.5" />
          Export
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportGuestsCSV(visible)}>
          Export visible — {visible.length}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportGuestsCSV(withoutCancelled)}>
          Exclude cancelled — {withoutCancelled.length}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GuestsExport;
