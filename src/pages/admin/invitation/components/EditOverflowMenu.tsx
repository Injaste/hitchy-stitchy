import { memo } from "react";
import { MoreHorizontal, Undo2, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useInvitationModalStore } from "../hooks/useInvitationModalStore";

interface EditOverflowMenuProps {
  isDirty: boolean;
}

// Secondary lifecycle actions. Items open the matching confirm dialog via the
// store; the dialogs live in modals/. (Publish/Schedule/Unpublish live in the
// footer's split button.)
const EditOverflowMenu = memo(({ isDirty }: EditOverflowMenuProps) => {
    const openConfirm = useInvitationModalStore((s) => s.openConfirm);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="More actions"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {isDirty && (
            <DropdownMenuItem onSelect={() => openConfirm("discard")}>
              <Undo2 className="size-4" />
              Discard changes
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => openConfirm("reset")}>
            <RotateCcw className="size-4" />
            Reset to template
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => openConfirm("delete")}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );
});

EditOverflowMenu.displayName = "EditOverflowMenu";

export default EditOverflowMenu;
