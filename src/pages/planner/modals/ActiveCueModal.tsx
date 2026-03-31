import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StickyNote } from "lucide-react";
import { useModalStore } from "@/pages/planner/store/useModalStore";
import { useCueStore } from "@/pages/planner/store/useCueStore";
import { useAdminStore } from "@/pages/planner/store/useAdminStore";
import { getAssigneeDisplay } from "@/pages/planner/utils/assigneeDisplay";

export function ActiveCueModal() {
  const { isActiveCueModalOpen, closeActiveCueModal } = useModalStore();
  const { activeCueEvent } = useCueStore();
  const { teamRoles } = useAdminStore();

  return (
    <Dialog open={isActiveCueModalOpen} onOpenChange={closeActiveCueModal}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg">
        <DialogHeader>
          <DialogTitle>Active Event Details</DialogTitle>
        </DialogHeader>
        {activeCueEvent && (
          <div className="space-y-4 mt-4">
            <h3 className="text-xl font-bold text-primary">
              {activeCueEvent.title}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-muted-foreground">
                  Time:
                </span>
                <p className="text-foreground">{activeCueEvent.time}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">
                  Assignees:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activeCueEvent.assignees.map((role) => (
                    <span
                      key={role}
                      className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border"
                    >
                      {getAssigneeDisplay(role, teamRoles)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground text-sm">
                Description:
              </span>
              <p className="text-foreground text-sm mt-1">
                {activeCueEvent.description}
              </p>
            </div>
            {activeCueEvent.notes && (
              <div>
                <span className="font-semibold text-muted-foreground text-sm">
                  Notes:
                </span>
                <div className="mt-1 text-sm bg-primary/5 p-3 rounded-md text-primary border border-primary/10 flex gap-2 items-start">
                  <StickyNote className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  <span className="leading-relaxed">
                    {activeCueEvent.notes}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        <DialogFooter className="pt-4">
          <Button onClick={closeActiveCueModal} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
