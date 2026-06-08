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
  guests: Guest[];
  /** Guests the user has explicitly checked, across the whole list. */
  allGuests: Guest[];
}

/**
 * Context-aware CSV export. An explicit selection wins and exports verbatim;
 * otherwise it exports the visible set, offering an "exclude cancelled" choice
 * only when the visible set actually contains cancelled guests.
 */
const GuestsExport: FC<GuestsExportProps> = ({ guests, allGuests }) => {
  // Explicit selection — export exactly what was picked, no menu.
  if (allGuests.length > 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-xs"
        onClick={() => exportGuestsCSV(allGuests)}
      >
        <Download className="w-3.5 h-3.5" />
        Export {allGuests.length} selected
      </Button>
    );
  }

  const exportConfirmedGuests = guests.filter((g) => g.status === "confirmed");
  // Only offer the exclude option when the view is a genuine mix — an
  // all-confirmed or all-cancelled view has nothing meaningful to strip.
  const isMixed =
    exportConfirmedGuests.length > 0 &&
    exportConfirmedGuests.length < guests.length;

  // Nothing to choose between — a single plain action is enough.
  if (!isMixed) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-xs"
        disabled={guests.length === 0}
        onClick={() => exportGuestsCSV(guests)}
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
          disabled={guests.length === 0}
        >
          <Download className="w-3.5 h-3.5" />
          Export
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          className="flex items-center justify-between"
          onClick={() => exportGuestsCSV(exportConfirmedGuests)}
        >
          <span>Confirmed</span>
          <span>— {exportConfirmedGuests.length}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center justify-between"
          onClick={() => exportGuestsCSV(guests)}
        >
          <span>All</span>
          <span>— {guests.length}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GuestsExport;
