import { Download, MailCheck, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import { fadeIn } from "@/pages/admin/animations";
import { RSVPStats } from "./RSVPStats";
import { RSVPTable } from "./RSVPTable";
import type { RSVP } from "./types";

function exportRSVPsCSV(rsvps: RSVP[]) {
  const headers = ["Name", "Phone", "Guests", "Status", "Dietary Notes", "Submitted At"];
  const rows = rsvps.map((r) => [
    r.name,
    r.phone ?? r.email ?? "",
    String(r.guests),
    r.status,
    r.dietaryRequirements ?? "",
    r.submittedAt,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rsvps-export-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function RSVPTab() {
  const { rsvps } = useAdminStore();
  const { openManualRSVPModal } = useModalStore();

  return (
    <div className="space-y-6 pb-24">
      <RSVPStats rsvps={rsvps} />

      {rsvps.length === 0 ? (
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeIn(0)}
          className="flex flex-col items-center justify-center py-20 gap-3 text-center"
        >
          <MailCheck className="h-10 w-10 text-muted-foreground opacity-30" />
          <p className="font-semibold text-foreground">No RSVPs yet</p>
          <p className="text-sm text-muted-foreground">
            RSVPs from the invitation page will appear here.
          </p>
          <Button size="sm" className="mt-2 gap-1.5" onClick={openManualRSVPModal}>
            <Plus className="h-4 w-4" />
            Manual RSVP
          </Button>
        </motion.div>
      ) : (
        <>
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => exportRSVPsCSV(rsvps)}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button size="sm" className="gap-1.5" onClick={openManualRSVPModal}>
              <Plus className="h-4 w-4" />
              Manual RSVP
            </Button>
          </div>
          <RSVPTable />
        </>
      )}
    </div>
  );
}
