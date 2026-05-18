import { Card } from "@/components/ui/card";
import OtherDraftRow from "./OtherDraftRow";
import DraftCountBadge from "./DraftCountBadge";
import type { TemplateTheme } from "../../types";

interface OtherDraftsListProps {
  templates: TemplateTheme[];
  onEdit: (themeId: string) => void;
}

const OtherDraftsList = ({ templates, onEdit }: OtherDraftsListProps) => {
  if (templates.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-2 px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Other drafts
        </h3>
        <DraftCountBadge count={templates.length} />
      </div>
      <Card className="p-0 overflow-hidden">
        {templates.map((template) => (
          <OtherDraftRow
            key={template.theme_id}
            template={template}
            onEdit={onEdit}
          />
        ))}
      </Card>
    </section>
  );
};

export default OtherDraftsList;
