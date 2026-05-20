import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import YourThemesGallery from "./YourThemesGallery";
import BrowseTemplatesGallery from "./BrowseTemplatesGallery";
import BrowseTemplatesSheet from "./BrowseTemplatesSheet";
import type { TemplateTheme } from "../../types";

interface TemplateViewProps {
  templates: TemplateTheme[];
  onEdit: (themeId: string) => void;
}

const TemplateView = ({ templates, onEdit }: TemplateViewProps) => {
  const { yours, browse } = useMemo(() => {
    return {
      yours: templates.filter((t) => t.theme_id),
      browse: templates.filter((t) => !t.theme_id),
    };
  }, [templates]);

  const hasTheme = yours.length > 0;
  const [isBrowseOpen, setBrowseOpen] = useState(false);

  if (!hasTheme) {
    return (
      <div className="space-y-4">
        <div className="px-1 space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Choose a template to begin
          </h3>
          <p className="text-sm text-muted-foreground">
            Your invitation starts with a theme.
          </p>
        </div>
        <BrowseTemplatesGallery templates={browse} onEdit={onEdit} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-end justify-between px-1 gap-4">
          <div className="space-y-1 min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Your themes
            </h3>
            <p className="text-sm text-muted-foreground">
              {yours.length} {yours.length === 1 ? "theme" : "themes"} · choose
              one to publish.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBrowseOpen(true)}
            className="shrink-0 gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Browse templates
          </Button>
        </div>
        <YourThemesGallery templates={yours} onEdit={onEdit} />
      </div>

      <BrowseTemplatesSheet
        templates={browse}
        open={isBrowseOpen}
        onClose={() => setBrowseOpen(false)}
        onEdit={onEdit}
      />
    </>
  );
};

export default TemplateView;
