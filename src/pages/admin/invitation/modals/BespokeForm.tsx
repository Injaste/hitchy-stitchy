import { useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { FieldGroup } from "@/components/ui/field";
import {
  TextField,
  TextareaField,
  SelectField,
  FormBody,
} from "@/components/custom/form";
import { formatPrice } from "@/pages/admin/plan/utils";
import { themeRegistry } from "@/pages/wedding/templates";

import { useTemplatesQuery } from "../queries";
import { bespokeFormSchema, type BespokeFormValues } from "../types";
import { BESPOKE_PRICE } from "../components/bespoke";

// Schema errors mapped to per-field messages for FieldShell.
function validateBespokeForm(value: unknown) {
  const parsed = bespokeFormSchema.safeParse(value);
  if (parsed.success) return undefined;

  const fields: Record<string, { message: string }> = {};
  const properties = z.treeifyError(parsed.error).properties ?? {};
  for (const [key, tree] of Object.entries(properties)) {
    if (tree?.errors?.length) fields[key] = { message: tree.errors[0] };
  }
  return Object.keys(fields).length ? { fields } : undefined;
}

interface UseBespokeFormOpts {
  onSubmit: (values: BespokeFormValues) => void;
}

export const useBespokeForm = ({ onSubmit }: UseBespokeFormOpts) =>
  useForm({
    defaultValues: {
      style: "",
      colours: "",
      context: "",
      vision: "",
      reference_template_key: null as string | null,
      references: "",
    },
    validators: {
      onSubmit: ({ value }) => validateBespokeForm(value),
      onChange: ({ value }) => validateBespokeForm(value),
    },
    onSubmit: ({ value }) => {
      onSubmit(bespokeFormSchema.parse(value));
    },
  });

const BespokeForm = () => {
  const { data: templates } = useTemplatesQuery();

  // Only templates we can actually render are worth offering as a starting point.
  const templateOptions = useMemo(
    () =>
      (templates ?? [])
        .filter((t) => themeRegistry[t.template_key])
        .map((t) => ({ value: t.template_key, label: t.name })),
    [templates],
  );

  return (
    <FormBody>
      <FieldGroup>
        <TextField
          name="style"
          label="Style"
          placeholder="e.g. Modern minimalist, Traditional Malay"
        />
        <TextField
          name="colours"
          label="Colours"
          placeholder="e.g. Sage green & gold"
        />
        <TextField
          name="context"
          label="Ceremony & cultural context"
          placeholder="e.g. Malay akad nikah, then a Chinese tea ceremony"
        />
        <TextareaField
          name="vision"
          label="Your vision"
          rows={3}
          placeholder="The story, feel, and any must-have elements you'd like us to capture"
        />
        <SelectField
          name="reference_template_key"
          label="Base it on a template"
          optional
          nullable
          nullLabel="Start from scratch"
          placeholder="Start from scratch"
          options={templateOptions}
        />
        <TextField
          name="references"
          label="Inspiration links"
          optional
          placeholder="Pinterest, images, or other invites you love"
        />

        <div className="space-y-1 text-center text-xs text-muted-foreground">
          <p>
            A one-off service · {formatPrice(BESPOKE_PRICE)}. We'll review your
            brief and send a proof before anything goes live.
          </p>
          <p>Online payment is being set up — coming soon.</p>
        </div>
      </FieldGroup>
    </FormBody>
  );
};

export default BespokeForm;
