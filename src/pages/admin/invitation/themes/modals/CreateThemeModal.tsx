import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Palette } from "lucide-react";

import {
  FormDialog,
  FormFooter,
  FormHeader,
  FormBody,
  TextField,
} from "@/components/custom/form";
import { FieldGroup } from "@/components/ui/field";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useInvitationModalStore } from "../../store/useInvitationModalStore";
import { useThemesMutations } from "../../queries";

const themeFormSchema = z.object({
  name: z.string().trim().min(1, "Required"),
});

type ThemeFormValues = z.infer<typeof themeFormSchema>;

const CreateThemeModal = () => {
  const isCreateOpen = useInvitationModalStore((s) => s.isCreateOpen);
  const selectedTemplateId = useInvitationModalStore(
    (s) => s.selectedTemplateId,
  );
  const closeAll = useInvitationModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { create } = useThemesMutations();

  const form = useForm({
    defaultValues: { name: "" } as ThemeFormValues,
    validators: {
      onSubmit: themeFormSchema,
      onChange: themeFormSchema,
    },
    onSubmit: ({ value }) => {
      if (!selectedTemplateId) return;
      create.mutate({
        event_id: eventId!,
        template_id: selectedTemplateId,
        name: value.name,
      });
    },
  });

  return (
    <FormDialog
      form={form}
      open={isCreateOpen}
      onOpenChange={closeAll}
      isPending={create.isPending}
      isSuccess={create.isSuccess}
      isError={create.isError}
    >
      <FormHeader icon={<Palette className="size-4" />} title="Name your theme" />

      <FormBody>
        <FieldGroup>
          <TextField
            name="name"
            label="Theme name"
            placeholder="e.g. My Invitation"
            autoFocus
          />
        </FieldGroup>
      </FormBody>

      <FormFooter onCancel={closeAll} submitLabel="Create" />
    </FormDialog>
  );
};

export default CreateThemeModal;
