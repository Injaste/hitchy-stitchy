import type { ThemeFieldGroup } from "@/pages/wedding/templates/types";
import ThemeSheetSection from "./ThemeSheetSection";

interface ThemeSheetFormProps {
  schema: ThemeFieldGroup[];
}

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
