import { Plus } from "lucide-react";

interface AddInvitationCardProps {
  onClick: () => void;
}

// Create-event-card style affordance to browse/add. (Per-day in Step 3;
// one-per-event for now, so a second create is guarded server-side.)
const AddInvitationCard = ({ onClick }: AddInvitationCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className="h-full w-full min-h-44 rounded-xl border-2 border-dashed border-foreground/20 hover:border-primary bg-transparent transition-colors flex flex-col items-center justify-center gap-4 p-6 cursor-pointer group"
  >
    <div className="size-10 rounded-full border border-dashed border-muted-foreground/30 group-hover:border-primary grid place-items-center transition-colors">
      <Plus className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
    </div>
    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
      Add invitation
    </p>
  </button>
);

export default AddInvitationCard;
