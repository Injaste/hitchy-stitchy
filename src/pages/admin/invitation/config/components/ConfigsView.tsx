import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { FormShellContext } from "@/components/custom/form/form-context";
import { Button } from "@/components/ui/button";
import { RSVP_MODES, type Invitation } from "../../types";
import { TIME_REGEX } from "@/pages/admin/types";
import TimingSection from "../sections/TimingSection";
import RSVPSection from "../sections/RSVPSection";
import GuestLimitsSection from "../sections/GuestLimitsSection";
import FormFieldsSection from "../sections/FormFieldsSection";
import ConfirmationSection from "../sections/ConfirmationSection";
import {
  useConfigSubmit,
  type ConfigFormValues,
} from "../hooks/useConfigSubmit";

const schema = z.object({
  event_date: z.string().transform((v) => v.trim() || null),
  event_time_start: z
    .string()
    .refine((v) => v === "" || TIME_REGEX.test(v), "Please enter a valid time")
    .transform((v) => v.trim() || null),
  event_time_end: z
    .string()
    .refine((v) => v === "" || TIME_REGEX.test(v), "Please enter a valid time")
    .transform((v) => v.trim() || null),
  rsvp_mode: z.enum(RSVP_MODES),
  rsvp_deadline_date: z.string().transform((v) => v.trim() || null),
  rsvp_deadline_time: z
    .string()
    .refine((v) => v === "" || TIME_REGEX.test(v), "Please enter a valid time")
    .transform((v) => v.trim() || null),
  max_guests: z.coerce
    .number()
    .min(1, "Must be 1 or more")
    .max(10000, "Must be 10,000 or less")
    .nullable(),
  guest_count_min: z.coerce.number().min(1, "Must be 1 or more").max(99),
  guest_count_max: z.coerce.number().min(1, "Must be 1 or more").max(99),
  confirmation_message: z
    .string()
    .max(500, "Keep under 500 characters")
    .transform((v) => v.trim() || null),
  message_visible: z.boolean(),
  message_required: z.boolean(),
});

interface ConfigsViewProps {
  invitation: Invitation;
}

const ConfigsView = ({ invitation }: ConfigsViewProps) => {
  const { submit, mutation } = useConfigSubmit();
  const [attemptCount, setAttemptCount] = useState(0);

  const [initDate, initTime = ""] = (invitation.rsvp_deadline ?? "").split(" ");

  const form = useForm({
    defaultValues: {
      event_date: invitation.event_date ?? "",
      event_time_start: invitation.event_time_start ?? "",
      event_time_end: invitation.event_time_end ?? "",
      rsvp_mode: invitation.rsvp_mode,
      rsvp_deadline_date: initDate ?? "",
      rsvp_deadline_time: (initTime || "").slice(0, 5),
      max_guests: invitation.max_guests,
      guest_count_min: invitation.guest_count_min,
      guest_count_max: invitation.guest_count_max,
      confirmation_message: invitation.confirmation_message ?? "",
      message_visible: invitation.config.rsvp.fields.message.visible,
      message_required: invitation.config.rsvp.fields.message.required,
    },
    validators: {
      onChange: ({ value }) => {
        const parsed = schema.safeParse(value);
        if (parsed.success) return undefined;
        const properties = z.treeifyError(parsed.error).properties ?? {};
        const fields = Object.fromEntries(
          Object.entries(properties)
            .filter(([, tree]) => tree?.errors?.length)
            .map(([key, tree]) => [key, { message: tree!.errors[0] }]),
        );
        return { fields };
      },
    },
    onSubmit: ({ value }) => {
      const parsed = schema.safeParse(value);
      if (!parsed.success) return;
      submit(parsed.data as ConfigFormValues);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAttemptCount((c) => c + 1);
    form.handleSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setAttemptCount((c) => c + 1);
      form.handleSubmit();
    }
  };

  return (
    <FormShellContext.Provider
      value={{
        attemptCount,
        form,
        isPending: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
      }}
    >
      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="max-w-2xl space-y-4"
      >
        <TimingSection />
        <RSVPSection />
        <GuestLimitsSection />
        <FormFieldsSection />
        <ConfirmationSection />

        <form.Subscribe selector={(s: { isDirty: boolean }) => s.isDirty}>
          {(isDirty: boolean) => (
            <div className="flex justify-end pt-2">
              <Button disabled={!isDirty}>Save changes</Button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </FormShellContext.Provider>
  );
};

export default ConfigsView;
