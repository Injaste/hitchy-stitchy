import { useState, type FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { widthReveal } from "@/lib/animations";
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
  const [menuOpen, setMenuOpen] = useState(false);

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

  // A single button that stays mounted across the mixed / not-mixed flip, so the
  // chevron can reveal and collapse via AnimatePresence. When not mixed the menu
  // is held closed and a click exports directly — preserving one-click export.
  return (
    <DropdownMenu
      open={isMixed && menuOpen}
      onOpenChange={(open) => {
        // Only the mixed view has a menu; ignore Radix's open requests
        // otherwise so a not-mixed click can't leave `menuOpen` stuck true
        // (which would pop the menu the moment the view turns mixed).
        if (isMixed) setMenuOpen(open);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={guests.length === 0}
          onClick={isMixed ? undefined : () => exportGuestsCSV(guests)}
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
          <AnimatePresence initial={false}>
            {isMixed && (
              <motion.span
                key="chevron"
                variants={widthReveal}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="inline-flex overflow-hidden"
              >
                <ChevronDown className="w-3 h-3" />
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      {isMixed && (
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
      )}
    </DropdownMenu>
  );
};

export default GuestsExport;
