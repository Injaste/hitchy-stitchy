import type { FC } from "react";
import { useForm } from "@tanstack/react-form";

import { FieldGroup } from "@/components/ui/field";
import { DialogBody } from "@/components/ui/dialog";
import {
  TextField,
  TextareaField,
  SelectField,
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
}

export const useGuestForm = ({ defaultValues, onSubmit }: UseGuestFormOpts) =>
  useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      phone: defaultValues?.phone ?? "",
      guest_count: defaultValues?.guest_count ?? 1,
      status: defaultValues?.status ?? "pending",
      message: defaultValues?.message ?? "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const parsed = guestFormSchema.safeParse(value);

        if (!parsed.success) {
          const properties = z.treeifyError(parsed.error).properties ?? {};

          const fields = Object.fromEntries(
            Object.entries(properties)
              .filter(([, tree]) => tree?.errors?.length)
              .map(([key, tree]) => [key, { message: tree!.errors[0] }]),
          );

          return { fields };
        }
      },
      onChange: ({ value }) => {
        const parsed = guestFormSchema.safeParse(value);

        if (!parsed.success) {
          const properties = z.treeifyError(parsed.error).properties ?? {};

          const fields = Object.fromEntries(
            Object.entries(properties)
              .filter(([, tree]) => tree?.errors?.length)
              .map(([key, tree]) => [key, { message: tree!.errors[0] }]),
          );

          return { fields };
        }
      },
    },
    onSubmit: ({ value }) => {
      onSubmit(guestFormSchema.parse(value));
    },
  });

interface GuestFormProps {
  maxGuest: number;
}

const GuestForm: FC<GuestFormProps> = ({ maxGuest }) => {
  return (
    <DialogBody>
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
            min={1}
            max={maxGuest}
            step={1}
            hint={`Max: ${maxGuest} guests`}
          />
          <SelectField name="status" label="Status" options={STATUS_OPTIONS} />
        </div>
        <TextareaField
          name="message"
          label="Message"
          optional
          rows={3}
          placeholder="Notes you want to keep against this guest…"
        />
      </FieldGroup>
    </DialogBody>
  );
};

export default GuestForm;
