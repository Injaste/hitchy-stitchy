import { MailCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminStore } from "@/pages/planner/store/useAdminStore";
import { useRSVPMutations } from "./queries";
import { type RSVP, statusVariant } from "./types";

export function RSVPTable() {
  const { rsvps } = useAdminStore();
  const { updateStatus } = useRSVPMutations();

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">RSVP Submissions</CardTitle>
        <MailCheck className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Guests</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Dietary</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rsvps.map((rsvp) => (
                  <tr
                    key={rsvp.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {rsvp.name}
                      <p className="text-[10px] text-muted-foreground font-normal">
                        {rsvp.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {rsvp.guests + 1}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={statusVariant[rsvp.status]}
                        className="text-[10px]"
                      >
                        {rsvp.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground italic max-w-[150px] truncate">
                      {rsvp.dietaryRequirements || "–"}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={rsvp.status}
                        onValueChange={(val) =>
                          updateStatus.mutate({
                            id: rsvp.id,
                            status: val as RSVP["status"],
                          })
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className="text-[10px] font-bold w-28"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="Declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
