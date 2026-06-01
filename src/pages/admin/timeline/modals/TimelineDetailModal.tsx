import { format } from "date-fns";
import { Users } from "lucide-react";
import { parseLocalDate, formatTimeRange } from "@/lib/utils/utils-time";
import ArraySeparator from "@/components/custom/array-separator";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDetailActions,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useAccess } from "../../hooks/useAccess";
import { useAdminStore } from "../../store/useAdminStore";
import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import NotesMarkdown from "@/components/custom/notes-markdown";
import MemberBadge from "@/pages/admin/members/components/MemberBadge";

const TimelineDetailModal = () => {
  const isDetailOpen = useTimelineModalStore((s) => s.isDetailOpen);
  const selectedItem = useTimelineModalStore((s) => s.selectedItem);
  const closeAll = useTimelineModalStore((s) => s.closeAll);
  const openEdit = useTimelineModalStore((s) => s.openEdit);
  const openDelete = useTimelineModalStore((s) => s.openDelete);

  const { canUpdate, canDelete } = useAccess();
  const { memberId } = useAdminStore();

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
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {item.title}
            {item.label && (
              <Badge variant="secondary" className="text-2xs font-normal">
                {item.label}
              </Badge>
            )}
          </DialogTitle>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>{dateLabel}</span>
            <span className="text-muted-foreground/40">·</span>
            <ArraySeparator items={timeLabel} separator="-" className="gap-1" />
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            {item.assignees.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Users className="w-3 h-3 shrink-0" />
                  Assignees
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[...item.assignees].sort((a) => (a === memberId ? -1 : 1)).map((id) => (
                    <MemberBadge
                      key={id}
                      memberId={id}
                      variant={id === memberId ? "default" : "outline"}
                    />
                  ))}
                </div>
              </div>
            )}

            <NotesMarkdown content={item.details} />
          </div>
        </DialogBody>

        <Separator />

        <DialogDetailActions
          destructive={destructiveActions}
          primary={primaryAction}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TimelineDetailModal;
