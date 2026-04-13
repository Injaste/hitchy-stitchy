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

import { taskFormSchema, type TaskFormValues } from "../types"

interface TaskFormProps {
  defaultValues?: Partial<TaskFormValues>
  onSubmit: (values: TaskFormValues) => void
  onCancel: () => void
  isPending: boolean
  submitLabel: string
}

const TaskForm: FC<TaskFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}) => {
  const [attemptCount, setAttemptCount] = useState(0)

  const form = useForm({
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      priority: defaultValues?.priority ?? null,
      due_at: defaultValues?.due_at ?? null,
    },
    validators: {
      onSubmit: taskFormSchema,
      onChange: taskFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(taskFormSchema.parse(value))
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
        <form.Field name="title">
          {(field) => {
            const hasError = Boolean(field.state.meta.errors.length) && attemptCount > 0
            return (
              <AnimateItem errors={field.state.meta.errors} hasError={hasError} attemptCount={attemptCount}>
                <Field data-invalid={hasError} className="gap-2">
                  <FieldLabel>Title</FieldLabel>
                  <FieldContent>
                    <Input
                      placeholder="e.g. Confirm florist delivery time"
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

        <div className="space-y-1.5">
          <Label>
            Description{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <form.Field name="description">
            {(field) => (
              <Textarea
                placeholder="Additional details…"
                value={field.state.value ?? ""}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={3}
              />
            )}
          </form.Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <form.Field name="priority">
            {(field) => (
              <div className="space-y-1.5">
                <Label>
                  Priority{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Select
                  value={field.state.value ?? ""}
                  onValueChange={(v) => field.handleChange(v === "none" ? null : v as "low" | "medium" | "high")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Field name="due_at">
            {(field) => (
              <div className="space-y-1.5">
                <Label>
                  Due date{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  type="date"
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  className="[&::-webkit-calendar-picker-indicator]:opacity-50"
                />
              </div>
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

export default TaskForm
