import { useMemo } from "react";
import TemplateGalleryCard from "./TemplateGalleryCard";
import type { TemplateTheme } from "../../types";

interface BrowseTemplatesGalleryProps {
  templates: TemplateTheme[];
  onEdit: (themeId: string) => void;
}

const BrowseTemplatesGallery = ({
  templates,
  onEdit,
}: BrowseTemplatesGalleryProps) => {
  const sorted = useMemo(() => {
    return [...templates].sort((a, b) => a.name.localeCompare(b.name));
  }, [templates]);

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground px-1">
        You've used every available template.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {sorted.map((template) => (
        <TemplateGalleryCard
          key={template.id}
          template={template}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

export default BrowseTemplatesGallery;
