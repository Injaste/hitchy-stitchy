import type { FC } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-media-query";

import { useAccess } from "../../hooks/useAccess";
import { useLimitGuard } from "../../plan/hooks/useLimitGuard";
import { useGuestModalStore } from "../hooks/useGuestModalStore";

interface GuestsImportProps {
  /** Keep the word "Import" at every width. The crowded toolbar drops it on a
   *  phone; the empty state has the room and needs the sentence. */
  showLabel?: boolean;
}

/** Opens the paste/CSV import. Sits beside Export — the way in matching the way
 *  out — and beside "Add first guest" on the empty list, which is where a whole
 *  list most wants pasting. Already at the guest cap, the limit guard takes the
 *  click instead. */
const GuestsImport: FC<GuestsImportProps> = ({ showLabel = false }) => {
  const { canCreate } = useAccess();
  const guardAdd = useLimitGuard();
  const openImport = useGuestModalStore((s) => s.openImport);
  const isMobile = useIsMobile();

  if (!canCreate("guests")) return null;

  return (
    <Button
      variant="outline"
      size={isMobile ? "sm" : "md"}
      className="text-xs"
      aria-label="Import guests"
      onClick={() => {
        if (guardAdd("guests")) return;
        openImport();
      }}
    >
      <Upload className="w-3.5 h-3.5" />
      <span className={showLabel ? undefined : "hidden sm:inline"}>Import</span>
    </Button>
  );
};

export default GuestsImport;
