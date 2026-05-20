import { useState } from "react";
import { useTemplatesWithThemesQuery } from "../queries";
import TemplateView from "./components/TemplateView";
import ThemeEditorSheet from "./editor";

const Themes = () => {
  const { data: templates } = useTemplatesWithThemesQuery();
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);

  return (
    <>
      <TemplateView templates={templates ?? []} onEdit={setEditingThemeId} />

      <ThemeEditorSheet
        themeId={editingThemeId}
        open={!!editingThemeId}
        onClose={() => setEditingThemeId(null)}
      />
    </>
  );
};

export default Themes;
