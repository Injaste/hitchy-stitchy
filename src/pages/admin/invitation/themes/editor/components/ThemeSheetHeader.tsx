import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Theme, Template } from "../../../types";
import { useInvitationModalStore } from "../../../store/useInvitationModalStore";

interface ThemeSheetHeaderProps {
  theme: Theme;
  template: Template;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onClose: () => void;
}

const ThemeSheetHeader = ({
  theme,
  template,
  isDirty,
  isSaving,
  onSave,
  onClose,
}: ThemeSheetHeaderProps) => {
  const openPublish = useInvitationModalStore((s) => s.openPublish);

  return (
    <div className="flex items-center justify-between gap-4 py-4 bg-background">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          disabled={isSaving}
          aria-label="Close"
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h2 className="text-base font-medium truncate font-display">
            {theme.name}
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            {template.name}
          </p>
        </div>
        {theme.is_published && (
          <Badge
            variant="outline"
            className="shrink-0 text-2xs font-bold uppercase tracking-wide text-primary border-primary/30"
          >
            Live
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => openPublish(theme)}
          disabled={isSaving}
        >
          {theme.is_published ? "Republish" : "Publish"}
        </Button>
        <Button size="sm" onClick={onSave} disabled={!isDirty || isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default ThemeSheetHeader;

// TODO use SubmitButton instead.. and {theme.is_published ? "Publish" : "Save"}
// TODO THEN THE BUTTON ONTOP JUST RENDER PUBLISH
// TODO FIND A BETTER WAY TO HANDLE THIS LOGIC... THE USER MUST KNOW THAT SAVING ALSO PUBLISHES THE CHANGES
