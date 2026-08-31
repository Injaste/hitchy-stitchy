import type { FC, ReactNode } from "react";
import { Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import EmptyState from "@/components/custom/states/empty-state";

interface GuestsEmptyProps {
  onAdd: () => void;
  canCreate: boolean;
  /** The paste/CSV door, passed in already gated. An empty list is exactly
   *  where a whole list wants pasting, so it belongs beside the first guest. */
  importAction?: ReactNode;
}

const GuestsEmpty: FC<GuestsEmptyProps> = ({
  onAdd,
  canCreate,
  importAction,
}) => (
  <EmptyState
    icon={
      <div className="w-16 h-16 rounded-full bg-primary/10 border border-dashed border-primary/20 flex items-center justify-center">
        <Users className="w-7 h-7 text-primary" />
      </div>
    }
    title="Your guest list starts here"
    description="Add guests to your invitation pages and track their RSVPs."
    action={
      canCreate ? (
        <>
          <Button onClick={onAdd} className="gap-1">
            <Plus className="w-4 h-4" />
            Add First Guest
          </Button>
          {importAction}
        </>
      ) : undefined
    }
  />
);

export default GuestsEmpty;
