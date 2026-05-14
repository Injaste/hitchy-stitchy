import { useForm } from "@tanstack/react-form"

import { Input } from "@/components/ui/input"
import { FieldGroup } from "@/components/ui/field"
import { DialogBody } from "@/components/ui/dialog"
import {
  FieldShell,
  TextField,
  TextareaField,
} from "@/components/custom/form"

import { guestFormSchema, type GuestFormValues } from "../types"

interface UseGuestFormOpts {
  defaultValues?: Partial<GuestFormValues>
  onSubmit: (values: GuestFormValues) => void
}

export const useGuestForm = ({ defaultValues, onSubmit }: UseGuestFormOpts) =>
  useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      phone: defaultValues?.phone ?? "",
      guest_count: defaultValues?.guest_count ?? 1,
      message: defaultValues?.message ?? "",
    },
    validators: {
      onSubmit: guestFormSchema,
      onChange: guestFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(guestFormSchema.parse(value))
    },
  })

const GuestForm = () => {
  return (
    <DialogBody>
      <FieldGroup>
        <TextField
          name="name"
          label="Name"
          placeholder="e.g. Ali Hassan"
        />
        <TextField
          name="phone"
          label="Phone"
          type="tel"
          placeholder="e.g. +60123456789"
        />
        <FieldShell name="guest_count" label="Party size">
          {(field) => (
            <Input
              type="number"
              min={1}
              step={1}
              value={field.state.value}
              onChange={(e) =>
                field.handleChange(
                  e.target.value === "" ? 1 : Number(e.target.value),
                )
              }
              onBlur={field.handleBlur}
            />
          )}
        </FieldShell>
        <TextareaField
          name="message"
          label="Message"
          optional
          rows={3}
          placeholder="Notes you want to keep against this guest…"
        />
      </FieldGroup>
    </DialogBody>
  )
}

export default GuestForm
