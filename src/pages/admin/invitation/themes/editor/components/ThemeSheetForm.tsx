import type { ThemeFieldGroup } from "@/pages/wedding/templates/types";
import ThemeSheetSection from "./ThemeSheetSection";

interface ThemeSheetFormProps {
  schema: ThemeFieldGroup[];
}

// Design half of the invitation form: a Card per schema section. All bound to the
// unified form (FormShellContext from EditPanel). The page name/title is not a
// form field — it derives from the page's segment/day.
const ThemeSheetForm = ({ schema }: ThemeSheetFormProps) => {
  return (
    <div className="space-y-4">
      {schema.map((group) => (
        <ThemeSheetSection key={group.title} group={group} />
      ))}
    </div>
  );
};

export default ThemeSheetForm;
