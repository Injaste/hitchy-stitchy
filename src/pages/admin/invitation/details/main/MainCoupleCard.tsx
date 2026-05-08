import { type FC } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FieldShell } from "@/components/custom/fields";
import { FormShellContext } from "@/components/custom/fields/form-context";
import type { DetailsDraft } from "../../types";

const schema = z.object({
  groom_name: z.string().max(100, "Please keep this under 100 characters"),
  bride_name: z.string().max(100, "Please keep this under 100 characters"),
});

interface MainCoupleCardProps {
  draft: DetailsDraft;
  onUpdate: (patch: Partial<DetailsDraft>) => void;
}

const MainCoupleCard: FC<MainCoupleCardProps> = ({ draft, onUpdate }) => {
  const form = useForm({
    defaultValues: {
      groom_name: draft.groom_name ?? "",
      bride_name: draft.bride_name ?? "",
    },
    validators: { onChange: schema },
  });

  return (
    <FormShellContext.Provider value={{ attemptCount: 1, form }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Couple</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="block space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FieldShell name="groom_name" label="Groom / Person 1">
                {(field) => (
                  <Input
                    placeholder="e.g. Danny"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      onUpdate({ groom_name: e.target.value || null });
                    }}
                    onBlur={field.handleBlur}
                  />
                )}
              </FieldShell>
              <FieldShell name="bride_name" label="Bride / Person 2">
                {(field) => (
                  <Input
                    placeholder="e.g. Naddy"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      onUpdate({ bride_name: e.target.value || null });
                    }}
                    onBlur={field.handleBlur}
                  />
                )}
              </FieldShell>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </FormShellContext.Provider>
  );
};

export default MainCoupleCard;
