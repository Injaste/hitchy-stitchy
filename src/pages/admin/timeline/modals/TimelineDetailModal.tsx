import { format } from "date-fns";
import { parseLocalDate, formatTimeRange } from "@/lib/utils/utils-time";
import { StickyNote } from "lucide-react";
import ArraySeparator from "@/components/custom/array-separator";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogDetailActions,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useAccess } from "../../hooks/useAccess";
import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import NotesMarkdown from "@/components/custom/notes-markdown";
import { useMembersQuery } from "@/pages/admin/members/queries";
import { getMemberName } from "@/pages/admin/utils/memberUtils";

const TimelineDetailModal = () => {
  const isDetailOpen = useTimelineModalStore((s) => s.isDetailOpen);
  const selectedItem = useTimelineModalStore((s) => s.selectedItem);
  const closeAll = useTimelineModalStore((s) => s.closeAll);
  const openEdit = useTimelineModalStore((s) => s.openEdit);
  const openDelete = useTimelineModalStore((s) => s.openDelete);

  const { canUpdate, canDelete } = useAccess();
  const { data: members = [] } = useMembersQuery();

  if (!selectedItem) return null;

  const item = selectedItem;
  const dateLabel = format(parseLocalDate(item.day), "d MMMM yyyy");
  const timeLabel = formatTimeRange(item.time_start, item.time_end);

  const destructiveActions = [
    canDelete("timeline") && { label: "Delete", onClick: openDelete },
  ];
  const primaryAction = canUpdate("timeline") && {
    label: "Edit",
    onClick: openEdit,
  };

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
          <DialogDescription>
            Schedule item details and assignees.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            {item.label && <Badge variant="outline">{item.label}</Badge>}
            <ArraySeparator
              items={[
                <ArraySeparator
                  items={timeLabel}
                  separator="-"
                  className="gap-1"
                />,
                dateLabel,
              ]}
              className="text-sm text-muted-foreground gap-2"
            />

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Assignees
              </p>
              {item.assignees.length === 0 ? (
                <p className="text-sm text-muted-foreground/50 italic">
                  No assignees
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {item.assignees.map((id) => (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      {getMemberName(id, members)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <StickyNote strokeWidth={3} className="w-3 h-3" />
                Details
              </p>
              <NotesMarkdown content={item.details} />
            </div>

            <Separator />
          </div>
        </DialogBody>

        <DialogDetailActions
          destructive={destructiveActions}
          primary={primaryAction}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TimelineDetailModal;
