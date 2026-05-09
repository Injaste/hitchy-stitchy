import { useRef, type FC } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { TextareaField, TextField } from "@/components/custom/fields";
import { FormShellContext } from "@/components/custom/fields/form-context";
import type { DetailsDraft } from "../../types";

const urlField = z.union([
  z.literal(""),
  z.url("Paste a full link starting with https://"),
]);

const schema = z.object({
  venue_name: z
    .string()
    .max(100, "Please keep this under 100 characters")
    .transform((v) => v.trim() || null),
  venue_address: z
    .string()
    .max(100, "Please keep this under 100 characters")
    .transform((v) => v.trim() || null),
  venue_map_link: urlField.transform((v) => v.trim() || null),
  venue_map_embed_url: urlField.transform((v) => v.trim() || null),
});

interface MainVenueCardProps {
  draft: DetailsDraft;
  onUpdate: (patch: Partial<DetailsDraft>) => void;
}

const MainVenueCard: FC<MainVenueCardProps> = ({ draft, onUpdate }) => {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const form = useForm({
    defaultValues: {
      venue_name: draft.venue_name ?? "",
      venue_address: draft.venue_address ?? "",
      venue_map_link: draft.venue_map_link ?? "",
      venue_map_embed_url: draft.venue_map_embed_url ?? "",
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
          <CardTitle className="text-sm">Venue</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <TextField
              name="venue_name"
              label="Venue Name"
              placeholder="e.g. Dewan Merak Kayangan"
            />
            <TextField
              name="venue_map_link"
              label="Map Link"
              placeholder="https://maps.google.com/..."
            />
            <TextField
              name="venue_map_embed_url"
              label="Map Embed URL"
              placeholder="https://maps.google.com/maps?..."
            />
            <TextareaField
              name="venue_address"
              label="Venue Address"
              placeholder="Full address"
              rows={2}
            />
          </FieldGroup>
        </CardContent>
      </Card>
    </FormShellContext.Provider>
  );
};

export default MainVenueCard;
