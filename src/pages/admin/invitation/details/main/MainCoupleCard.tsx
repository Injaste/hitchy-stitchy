import { useRef, type FC } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/custom/fields";
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
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const form = useForm({
    defaultValues: {
      groom_name: draft.groom_name ?? "",
      bride_name: draft.bride_name ?? "",
    },
    validators: { onChange: schema },
    listeners: {
      onChange: ({ formApi }) => {
        const parsed = schema.safeParse(formApi.state.values);
        if (!parsed.success) return;
        onUpdateRef.current(parsed.data);
      },
    },
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
              <TextField
                name="groom_name"
                label="Groom"
                placeholder="e.g. Danny"
              />
              <TextField
                name="bride_name"
                label="Bride"
                placeholder="e.g. Naddy"
              />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </FormShellContext.Provider>
  );
};

export default MainCoupleCard;

// TODO
/*
  TO ALLOW GROOM AND BRIDE TO SWAP POSITIONS IN THE THEME
*/
