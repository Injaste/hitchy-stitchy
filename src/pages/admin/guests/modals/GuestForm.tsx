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

const STATUS_OPTIONS: SelectFieldOption[] = [
  { value: "pending", label: STATUS_LABELS.pending },
  { value: "confirmed", label: STATUS_LABELS.confirmed },
  { value: "cancelled", label: STATUS_LABELS.cancelled },
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
      onSubmit: guestFormSchema,
      onChange: guestFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(guestFormSchema.parse(value));
    },
  });

const GuestForm = () => {
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
            step={1}
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
