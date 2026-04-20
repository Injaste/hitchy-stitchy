import { useState, type FC } from "react"
import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { AnimateItem } from "@/components/animations/forms/field-animate"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

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
  const [attemptCount, setAttemptCount] = useState(0)

  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      phone: defaultValues?.phone ?? "",
      guest_count: defaultValues?.guest_count ?? 1,
      // Form state keeps message as a string — the schema transforms empty → null on submit.
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setAttemptCount((prev) => prev + 1)
    form.handleSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <FieldGroup className="block space-y-4">
        <form.Field name="name">
          {(field) => {
            const hasError =
              Boolean(field.state.meta.errors.length) && attemptCount > 0
            return (
              <AnimateItem
                errors={field.state.meta.errors}
                hasError={hasError}
                attemptCount={attemptCount}
              >
                <Field data-invalid={hasError} className="gap-2">
                  <FieldLabel>Name</FieldLabel>
                  <FieldContent>
                    <Input
                      placeholder="e.g. Ali Hassan"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </FieldContent>
                </Field>
              </AnimateItem>
            )
          }}
        </form.Field>

        <form.Field name="phone">
          {(field) => {
            const hasError =
              Boolean(field.state.meta.errors.length) && attemptCount > 0
            return (
              <AnimateItem
                errors={field.state.meta.errors}
                hasError={hasError}
                attemptCount={attemptCount}
              >
                <Field data-invalid={hasError} className="gap-2">
                  <FieldLabel>Phone</FieldLabel>
                  <FieldContent>
                    <Input
                      type="tel"
                      placeholder="e.g. +60123456789"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </FieldContent>
                </Field>
              </AnimateItem>
            )
          }}
        </form.Field>

        <form.Field name="guest_count">
          {(field) => {
            const hasError =
              Boolean(field.state.meta.errors.length) && attemptCount > 0
            return (
              <AnimateItem
                errors={field.state.meta.errors}
                hasError={hasError}
                attemptCount={attemptCount}
              >
                <Field data-invalid={hasError} className="gap-2">
                  <FieldLabel>Party size</FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={field.state.value}
                      onChange={(e) => {
                        const v = e.target.value
                        field.handleChange(v === "" ? 1 : Number(v))
                      }}
                      onBlur={field.handleBlur}
                    />
                  </FieldContent>
                </Field>
              </AnimateItem>
            )
          }}
        </form.Field>

        <div className="space-y-1.5">
          <Label>
            Message{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <form.Field name="message">
            {(field) => (
              <Textarea
                placeholder="Notes you want to keep against this guest…"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={3}
              />
            )}
          </form.Field>
        </div>
      </FieldGroup>

      <DialogFooter className="flex justify-end gap-2 pt-2">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default GuestForm
