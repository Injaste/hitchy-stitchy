import { useMemo, useState } from "react";
import { useTemplatesWithThemesQuery } from "../queries";
import ActiveThemeCard from "./components/ActiveThemeCard";
import OtherDraftsList from "./components/OtherDraftsList";
import TemplateGallery from "./components/TemplateGallery";
import ThemeEditorSheet from "./editor";

const Themes = () => {
  const { data: templates } = useTemplatesWithThemesQuery();
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);

  const { active, others, available } = useMemo(() => {
    const all = templates ?? [];
    const created = all.filter((t) => t.theme_id);
    const available = all.filter((t) => !t.theme_id);

    const sortedCreated = [...created].sort((a, b) => {
      if (a.is_published !== b.is_published) return a.is_published ? -1 : 1;
      const ta = a.theme_updated_at ?? "";
      const tb = b.theme_updated_at ?? "";
      return tb.localeCompare(ta);
    });

    return {
      active: sortedCreated[0] ?? null,
      others: sortedCreated.slice(1),
      available,
    };
  }, [templates]);

  const handleEdit = (themeId: string) => setEditingThemeId(themeId);
  const handleClose = () => setEditingThemeId(null);

  return (
    <>
      <div className="max-w-2xl">
        {!active && (
          <TemplateGallery
            templates={available}
            title="Choose a template to begin"
            description="Your invitation starts with a theme."
          />
        )}

        {active && (
          <div className="space-y-8">
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Your invitation
              </h3>
              <ActiveThemeCard template={active} onEdit={handleEdit} />
            </section>

            <OtherDraftsList templates={others} onEdit={handleEdit} />

            {available.length > 0 && (
              <TemplateGallery templates={available} title="Add another draft" />
            )}
          </div>
        )}
      </div>

      <ThemeEditorSheet
        themeId={editingThemeId}
        open={!!editingThemeId}
        onClose={handleClose}
      />
    </>
  );
};

export default Themes;
