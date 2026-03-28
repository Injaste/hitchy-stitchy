import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { RSVPStats } from "./RSVPStats";
import { RSVPTable } from "./RSVPTable";

export function RSVPTab() {
  const { rsvps } = useAdminStore();
  return (
    <div className="space-y-6 pb-24">
      <RSVPStats rsvps={rsvps} />
      <RSVPTable />
    </div>
  );
}
