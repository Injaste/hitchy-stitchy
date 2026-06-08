import type { FC } from "react";
import { Plus, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import EmptyState from "@/components/custom/states/empty-state";

interface MembersEmptyProps {
  onInvite: () => void;
  canCreate: boolean;
}

const MembersEmpty: FC<MembersEmptyProps> = ({ onInvite, canCreate }) => (
  <EmptyState
    icon={
      <div className="w-16 h-16 rounded-full bg-primary/10 border border-dashed border-primary/20 flex items-center justify-center">
        <UserPlus className="w-7 h-7 text-primary" />
      </div>
    }
    title="Build your team"
    description="Invite the people helping you plan, from your maid of honour to your coordinator."
    action={
      canCreate ? (
        <Button onClick={onInvite} className="gap-1">
          <Plus className="w-4 h-4" />
          Invite first member
        </Button>
      ) : undefined
    }
  />
);

export default MembersEmpty;
