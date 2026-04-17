import { useState, type FC } from "react"
import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { AnimateItem } from "@/components/animations/forms/field-animate"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

import {
  roleFormSchema,
  CATEGORY_LABELS,
  type RoleFormValues,
} from "../types"

interface RoleFormProps {
  defaultValues?: Partial<RoleFormValues>
  onSubmit: (values: RoleFormValues) => void
  onCancel: () => void
  isPending: boolean
  submitLabel: string
}

const SELECTABLE_CATEGORIES = ["admin", "couple_attendant", "general"] as const

const RoleForm: FC<RoleFormProps> = ({
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
      short_name: defaultValues?.short_name ?? "",
      category: defaultValues?.category ?? "general",
      description: defaultValues?.description ?? "",
    },
    validators: {
      onSubmit: roleFormSchema,
      onChange: roleFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(roleFormSchema.parse(value))
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
                      placeholder="e.g. Coordinator"
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

        <form.Field name="short_name">
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
                  <FieldLabel>Short name</FieldLabel>
                  <FieldContent>
                    <Input
                      placeholder="e.g. CO"
                      maxLength={10}
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(e.target.value.toUpperCase())
                      }
                      onBlur={field.handleBlur}
                    />
                  </FieldContent>
                </Field>
              </AnimateItem>
            )
          }}
        </form.Field>

        <form.Field name="category">
          {(field) => (
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) =>
                  field.handleChange(v as RoleFormValues["category"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SELECTABLE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <div className="space-y-1.5">
          <Label>
            Description{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <form.Field name="description">
            {(field) => (
              <Textarea
                placeholder="What this role covers on the day…"
                value={field.state.value ?? ""}
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

export default RoleForm
