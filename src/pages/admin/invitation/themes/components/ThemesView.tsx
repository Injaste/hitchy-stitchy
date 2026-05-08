import { type FC } from "react";
import ThemeCard from "./ThemeCard";
import type { TemplateTheme } from "../../types";

interface ThemesViewProps {
  templates: TemplateTheme[];
}

const ThemesView: FC<ThemesViewProps> = ({ templates }) => {
  return (
    <div className="space-y-2">
      {templates.map((template) => (
        <ThemeCard key={template.id} template={template} />
      ))}
    </div>
  );
};

export default ThemesView;
