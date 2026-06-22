import type { FC } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import AdaptiveButton from "@/components/custom/adaptive-button";
import { useIsMobile } from "@/hooks/use-media-query";

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
  const isMobile = useIsMobile();
  // Match a dropdown trigger: h-9 on desktop, compact h-8 on mobile.
  const size = isMobile ? "sm" : "md";

  // Explicit selection — export exactly what was picked, no menu.
  if (allGuests.length > 0) {
    return (
      <Button
        variant="outline"
        size={size}
        className="text-xs"
        onClick={() => exportGuestsCSV(allGuests)}
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          Export {allGuests.length} selected
        </span>
      </Button>
    );
  }

  const exportConfirmedGuests = guests.filter((g) => g.status === "confirmed");
  // Only offer the exclude option when the view is a genuine mix — an
  // all-confirmed or all-cancelled view has nothing meaningful to strip.
  const isMixed =
    exportConfirmedGuests.length > 0 &&
    exportConfirmedGuests.length < guests.length;

  return (
    <AdaptiveButton
      asMenu={isMixed}
      onClick={() => exportGuestsCSV(guests)}
      disabled={guests.length === 0}
      size={size}
      className="text-xs"
      contentClassName="w-40"
      menu={
        <>
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
        </>
      }
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Export</span>
    </AdaptiveButton>
  );
};

export default GuestsExport;
