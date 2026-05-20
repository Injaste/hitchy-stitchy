import type { ThemeFieldGroup } from "@/pages/wedding/templates/types";
import ThemeNameField from "./ThemeNameField";
import ThemeSheetSection from "./ThemeSheetSection";

interface ThemeSheetFormProps {
  schema: ThemeFieldGroup[];
}

const ThemeSheetForm = ({ schema }: ThemeSheetFormProps) => {
  return (
    <div className="space-y-4">
      <ThemeNameField />

      {schema.map((group) => (
        <ThemeSheetSection key={group.title} group={group} />
      ))}
    </div>
  );
};

export default ThemeSheetForm;
