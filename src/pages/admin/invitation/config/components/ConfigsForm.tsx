import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import SubmitButton from "@/components/custom/form/SubmitButton";
import { useFormShell } from "@/components/custom/form/form-context";
import { TIME_REGEX } from "@/pages/admin/types";
import { RSVP_MODES, type Invitation } from "../../types";
import TimingSection from "../sections/TimingSection";
import RSVPSection from "../sections/RSVPSection";
import GuestLimitsSection from "../sections/GuestLimitsSection";
import FormFieldsSection from "../sections/FormFieldsSection";
import ConfirmationSection from "../sections/ConfirmationSection";

const schema = z
  .object({
    event_date: z
      .string()
      .nullable()
      .transform((v) => v?.trim() || null),
    event_time_start: z
      .string()
      .refine((v) => v === "" || TIME_REGEX.test(v), "Please enter a valid time")
      .transform((v) => v.trim() || null),
    event_time_end: z
      .string()
      .refine((v) => v === "" || TIME_REGEX.test(v), "Please enter a valid time")
      .transform((v) => v.trim() || null),
    rsvp_mode: z.enum(RSVP_MODES),
    rsvp_deadline_date: z
      .string()
      .nullable()
      .transform((v) => v?.trim() || null),
    rsvp_deadline_time: z
      .string()
      .refine((v) => v === "" || TIME_REGEX.test(v), "Please enter a valid time")
      .transform((v) => v.trim() || null),
    max_guests: z.preprocess(
      (v) => (v === "" || v == null ? null : Number(v)),
      z
        .number()
        .min(1, "Must be 1 or more")
        .max(10000, "Must be 10,000 or less")
        .nullable(),
    ),
    guest_count_min: z.coerce.number().min(1, "Must be 1 or more").max(99),
    guest_count_max: z.coerce.number().min(1, "Must be 1 or more").max(99),
    confirmation_message: z
      .string()
      .max(500, "Keep under 500 characters")
      .transform((v) => v.trim() || null),
    message_visible: z.boolean(),
    message_required: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.rsvp_deadline_date && !data.rsvp_deadline_time) {
      ctx.addIssue({
        code: "custom",
        path: ["rsvp_deadline_time"],
        message: "Time is required when a deadline date is set",
      });
    }
  });

export type ConfigFormValues = z.infer<typeof schema>;

interface UseConfigsFormOpts {
  invitation: Invitation;
  onSubmit: (values: ConfigFormValues) => void;
}

const parseDeadline = (deadline: string | null): { date: string; time: string } => {
  if (!deadline) return { date: "", time: "" };
  // Normalise space-separated ("YYYY-MM-DD HH:MM") or ISO ("YYYY-MM-DDTHH:MM…") to a parseable string
  const d = new Date(deadline.trim().replace(" ", "T"));
  if (isNaN(d.getTime())) return { date: "", time: "" };
  const pad = (n: number) => String(n).padStart(2, "0");
  // Convert UTC back to local for display
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

export const useConfigsForm = ({
  invitation,
  onSubmit,
}: UseConfigsFormOpts) => {
  const { date: initDate, time: initTime } = parseDeadline(invitation.rsvp_deadline);

  return useForm({
    defaultValues: {
      event_date: invitation.event_date ?? "",
      event_time_start: invitation.event_time_start ?? "09:00",
      event_time_end: invitation.event_time_end ?? "",
      rsvp_mode: invitation.rsvp_mode,
      rsvp_deadline_date: initDate,
      rsvp_deadline_time: initTime,
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
      onSubmit(parsed.data);
    },
  });
};

const ConfigsForm = () => {
  const { form } = useFormShell();

  return (
    <>
      <TimingSection />
      <RSVPSection />
      <GuestLimitsSection />
      <FormFieldsSection />
      <ConfirmationSection />

      <form.Subscribe selector={(s: { isDirty: boolean }) => s.isDirty}>
        {(isDirty: boolean) => (
          <div className="flex justify-end pt-2">
            <SubmitButton disabled={!isDirty}>Save changes</SubmitButton>
          </div>
        )}
      </form.Subscribe>
    </>
  );
};

export default ConfigsForm;
