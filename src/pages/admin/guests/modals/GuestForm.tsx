import type { FC } from "react"
import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup } from "@/components/ui/field"
import { DialogBody, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  FormShell,
  FieldShell,
  TextField,
  TextareaField,
} from "@/components/custom/fields"

import { guestFormSchema, type GuestFormValues } from "../types"

interface GuestFormProps {
  defaultValues?: Partial<GuestFormValues>
  onSubmit: (values: GuestFormValues) => void
  onCancel: () => void
  isPending: boolean
  submitLabel: string
}

const GuestForm: FC<GuestFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}) => {
  const form = useForm({
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

  return (
    <FormShell form={form} className="grid gap-4">
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
                  field.handleChange(e.target.value === "" ? 1 : Number(e.target.value))
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

      <Separator />

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </DialogFooter>
    </FormShell>
  )
}

export default GuestForm
