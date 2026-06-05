import type { FC } from "react";
import { useForm } from "@tanstack/react-form";

import { FieldGroup } from "@/components/ui/field";
import {
  TextField,
  TextareaField,
  SelectField,
  FormBody,
  type SelectFieldOption,
} from "@/components/custom/form";

import { guestFormSchema, STATUS_LABELS, type GuestFormValues } from "../types";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import z from "zod";

const STATUS_OPTIONS: SelectFieldOption[] = [
  {
    value: "pending",
    label: STATUS_LABELS.pending,
    icon: <Clock className="size-4 shrink-0 text-warning" />,
  },
  {
    value: "confirmed",
    label: STATUS_LABELS.confirmed,
    icon: <CheckCircle className="size-4 shrink-0 text-success" />,
  },
  {
    value: "cancelled",
    label: STATUS_LABELS.cancelled,
    icon: <XCircle className="size-4 shrink-0 text-destructive" />,
  },
];

interface UseGuestFormOpts {
  defaultValues?: Partial<GuestFormValues>;
  onSubmit: (values: GuestFormValues) => void;
  /** Party-size bounds from the invitation config; mirrors the create RPC. */
  minGuest: number;
  maxGuest: number;
}

// Schema errors plus a party-size range check against the invitation's
// configured min/max, so the client matches what the RPC will accept.
function validateGuestForm(
  value: GuestFormValues,
  minGuest: number,
  maxGuest: number,
) {
  const fields: Record<string, { message: string }> = {};

  const parsed = guestFormSchema.safeParse(value);
  if (!parsed.success) {
    const properties = z.treeifyError(parsed.error).properties ?? {};
    for (const [key, tree] of Object.entries(properties)) {
      if (tree?.errors?.length) fields[key] = { message: tree.errors[0] };
    }
  }

  const count = Number(value.guest_count);
  if (!fields.guest_count && Number.isFinite(count)) {
    if (count < minGuest) {
      fields.guest_count = {
        message: `At least ${minGuest} ${minGuest === 1 ? "guest" : "guests"}`,
      };
    } else if (count > maxGuest) {
      fields.guest_count = {
        message: `At most ${maxGuest} ${maxGuest === 1 ? "guest" : "guests"}`,
      };
    }
  }

  return Object.keys(fields).length ? { fields } : undefined;
}

export const useGuestForm = ({
  defaultValues,
  onSubmit,
  minGuest,
  maxGuest,
}: UseGuestFormOpts) =>
  useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      phone: defaultValues?.phone ?? "",
      guest_count: defaultValues?.guest_count ?? minGuest,
      status: defaultValues?.status ?? "pending",
      message: defaultValues?.message ?? "",
    },
    validators: {
      onSubmit: ({ value }) => validateGuestForm(value, minGuest, maxGuest),
      onChange: ({ value }) => validateGuestForm(value, minGuest, maxGuest),
    },
    onSubmit: ({ value }) => {
      onSubmit(guestFormSchema.parse(value));
    },
  });

interface GuestFormProps {
  minGuest: number;
  maxGuest: number;
  /** Hidden when the invitation's RSVP config disables the message field. */
  showMessage: boolean;
}

const GuestForm: FC<GuestFormProps> = ({ minGuest, maxGuest, showMessage }) => {
  const countHint =
    minGuest === maxGuest
      ? `${maxGuest} ${maxGuest === 1 ? "guest" : "guests"}`
      : `${minGuest}–${maxGuest} guests`;

  return (
    <FormBody>
      <FieldGroup>
        <TextField name="name" label="Name" placeholder="e.g. Ali Hassan" />
        <TextField
          name="phone"
          label="Phone"
          type="tel"
          placeholder="e.g. +60123456789"
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            name="guest_count"
            label="Party size"
            type="number"
            min={minGuest}
            max={maxGuest}
            step={1}
            hint={`Allowed: ${countHint}`}
          />
          <SelectField name="status" label="Status" options={STATUS_OPTIONS} />
        </div>
        {showMessage && (
          <TextareaField
            name="message"
            label="Message"
            optional
            rows={3}
            placeholder="Notes you want to keep against this guest…"
          />
        )}
      </FieldGroup>
    </FormBody>
  );
};

export default GuestForm;
