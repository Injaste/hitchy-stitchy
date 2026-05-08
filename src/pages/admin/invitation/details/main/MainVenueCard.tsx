import { type FC } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldShell } from "@/components/custom/fields";
import { FormShellContext } from "@/components/custom/fields/form-context";
import type { DetailsDraft } from "../../types";

const urlField = z.union([
  z.literal(""),
  z.string().url("Paste a full link starting with https://"),
]);

const schema = z.object({
  venue_name: z.string().max(100, "Please keep this under 100 characters"),
  venue_address: z.string().max(100, "Please keep this under 100 characters"),
  venue_map_link: urlField,
  venue_map_embed_url: urlField,
});

interface MainVenueCardProps {
  draft: DetailsDraft;
  onUpdate: (patch: Partial<DetailsDraft>) => void;
}

const MainVenueCard: FC<MainVenueCardProps> = ({ draft, onUpdate }) => {
  const form = useForm({
    defaultValues: {
      venue_name: draft.venue_name ?? "",
      venue_address: draft.venue_address ?? "",
      venue_map_link: draft.venue_map_link ?? "",
      venue_map_embed_url: draft.venue_map_embed_url ?? "",
    },
    validators: { onChange: schema },
  });

  return (
    <FormShellContext.Provider value={{ attemptCount: 1, form }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Venue</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="block space-y-4">
            <FieldShell name="venue_name" label="Venue Name">
              {(field) => (
                <Input
                  placeholder="e.g. Dewan Merak Kayangan"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    onUpdate({ venue_name: e.target.value || null });
                  }}
                  onBlur={field.handleBlur}
                />
              )}
            </FieldShell>
            <FieldShell name="venue_address" label="Venue Address">
              {(field) => (
                <Textarea
                  rows={2}
                  placeholder="Full address"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    onUpdate({ venue_address: e.target.value || null });
                  }}
                  onBlur={field.handleBlur}
                />
              )}
            </FieldShell>
            <FieldShell name="venue_map_link" label="Map Link">
              {(field) => (
                <Input
                  placeholder="https://maps.google.com/..."
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    onUpdate({ venue_map_link: e.target.value || null });
                  }}
                  onBlur={field.handleBlur}
                />
              )}
            </FieldShell>
            <FieldShell name="venue_map_embed_url" label="Map Embed URL">
              {(field) => (
                <Input
                  placeholder="https://maps.google.com/maps?..."
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    onUpdate({ venue_map_embed_url: e.target.value || null });
                  }}
                  onBlur={field.handleBlur}
                />
              )}
            </FieldShell>
          </FieldGroup>
        </CardContent>
      </Card>
    </FormShellContext.Provider>
  );
};

export default MainVenueCard;
