import type { ThemeFieldGroup } from "@/pages/wedding/templates/types";
import { TextField } from "@/components/custom/form";
import ThemeSheetSection from "./ThemeSheetSection";

interface ThemeSheetFormProps {
  schema: ThemeFieldGroup[];
}

// Design half of the invitation form: the name + a Card per schema section. All
// bound to the unified form (FormShellContext from EditPanel).
const ThemeSheetForm = ({ schema }: ThemeSheetFormProps) => {
  return (
    <div className="space-y-4">
      <TextField name="name" label="Invitation name" placeholder="Invitation name" />

      {schema.map((group) => (
        <ThemeSheetSection key={group.title} group={group} />
      ))}
    </div>
  );
};

export default ThemeSheetForm;
