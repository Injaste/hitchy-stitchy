import { useMemo } from "react";
import TemplateGalleryCard from "./TemplateGalleryCard";
import type { TemplateTheme } from "../../types";

interface YourThemesGalleryProps {
  templates: TemplateTheme[];
  onEdit: (themeId: string) => void;
}

const YourThemesGallery = ({ templates, onEdit }: YourThemesGalleryProps) => {
  const sorted = useMemo(() => {
    return [...templates].sort((a, b) => {
      const ap = !!a.published_at;
      const bp = !!b.published_at;
      if (ap !== bp) return ap ? -1 : 1;
      return (b.theme_updated_at ?? "").localeCompare(a.theme_updated_at ?? "");
    });
  }, [templates]);

  if (sorted.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

export default YourThemesGallery;
