import type { FC } from "react";
import { Plus, Upload, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import EmptyState from "@/components/custom/states/empty-state";

interface GuestsEmptyProps {
  onAdd: () => void;
  onImport: () => void;
  canCreate: boolean;
}

const GuestsEmpty: FC<GuestsEmptyProps> = ({ onAdd, onImport, canCreate }) => (
  <EmptyState
    icon={
      <div className="w-16 h-16 rounded-full bg-primary/10 border border-dashed border-primary/20 flex items-center justify-center">
        <Users className="w-7 h-7 text-primary" />
      </div>
    }
    title="Your guest list starts here"
    description="Add guests one at a time, or import a whole list from a spreadsheet."
    action={
      canCreate ? (
        <>
          <Button onClick={onAdd} className="gap-1">
            <Plus className="w-4 h-4" />
            Add First Guest
          </Button>
          {/* <Button onClick={onImport} variant="outline" className="gap-1">
            <Upload className="w-4 h-4" />
            Import CSV
          </Button> */}
        </>
      ) : undefined
    }
  />
);

export default GuestsEmpty;
