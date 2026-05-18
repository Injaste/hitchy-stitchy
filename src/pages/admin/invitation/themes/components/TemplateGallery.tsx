import TemplateGalleryCard from "./TemplateGalleryCard";
import type { TemplateTheme } from "../../types";

interface TemplateGalleryProps {
  templates: TemplateTheme[];
  title?: string;
  description?: string;
}

const TemplateGallery = ({
  templates,
  title,
  description,
}: TemplateGalleryProps) => {
  if (templates.length === 0) return null;

  return (
    <section className="space-y-4">
      {(title || description) && (
        <div className="px-1 space-y-1">
          {title && (
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((template) => (
          <TemplateGalleryCard key={template.id} template={template} />
        ))}
      </div>
    </section>
  );
};

export default TemplateGallery;
