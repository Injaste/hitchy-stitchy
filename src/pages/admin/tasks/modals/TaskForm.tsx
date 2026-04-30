import { useState, type FC } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import { DialogBody, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import AssigneeField from "@/pages/admin/components/AssigneeField";
import { useMembersQuery } from "@/pages/admin/members/queries";

import { taskFormSchema, type TaskFormValues } from "../types";

interface TaskFormProps {
  defaultValues?: Partial<TaskFormValues>;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

const TaskForm: FC<TaskFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}) => {
  const [attemptCount, setAttemptCount] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { data: members = [] } = useMembersQuery();

  const memberItems = members
    .filter((m) => !m.is_frozen)
    .map((m) => ({ id: m.id, label: m.display_name }));

  const form = useForm({
    defaultValues: {
      title: defaultValues?.title ?? "",
      details: defaultValues?.details ?? "",
      label: defaultValues?.label ?? "",
      priority: defaultValues?.priority ?? null,
      due_at: defaultValues?.due_at ?? null,
      assignees: defaultValues?.assignees ?? [],
    },
    validators: {
      onSubmit: taskFormSchema,
      onChange: taskFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(taskFormSchema.parse(value));
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAttemptCount((prev) => prev + 1);
    form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <DialogBody className="space-y-6">
        <FieldGroup className="block space-y-4">
          <form.Field name="title">
            {(field) => {
              const hasError =
                Boolean(field.state.meta.errors.length) && attemptCount > 0;
              return (
                <AnimateItem
                  errors={field.state.meta.errors}
                  hasError={hasError}
                  attemptCount={attemptCount}
                >
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
              );
            }}
          </form.Field>

          <form.Field name="label">
            {(field) => {
              const hasError =
                Boolean(field.state.meta.errors.length) && attemptCount > 0;
              return (
                <AnimateItem
                  errors={field.state.meta.errors}
                  hasError={hasError}
                  attemptCount={attemptCount}
                >
                  <Field data-invalid={hasError} className="gap-2">
                    <FieldLabel>
                      Label{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="e.g. Nikah, Sanding"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </FieldContent>
                  </Field>
                </AnimateItem>
              );
            }}
          </form.Field>

          <div className="grid grid-cols-2 gap-3">
            <form.Field name="priority">
              {(field) => {
                const hasError =
                  Boolean(field.state.meta.errors.length) && attemptCount > 0;
                return (
                  <AnimateItem
                    errors={field.state.meta.errors}
                    hasError={hasError}
                    attemptCount={attemptCount}
                  >
                    <Field data-invalid={hasError} className="gap-2">
                      <FieldLabel>
                        Priority{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FieldLabel>
                      <FieldContent>
                        <Select
                          value={field.state.value ?? ""}
                          onValueChange={(v) =>
                            field.handleChange(
                              v === "none"
                                ? null
                                : (v as "low" | "medium" | "high"),
                            )
                          }
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
                      </FieldContent>
                    </Field>
                  </AnimateItem>
                );
              }}
            </form.Field>

            <form.Field name="due_at">
              {(field) => {
                const hasError =
                  Boolean(field.state.meta.errors.length) && attemptCount > 0;
                return (
                  <AnimateItem
                    errors={field.state.meta.errors}
                    hasError={hasError}
                    attemptCount={attemptCount}
                  >
                    <Field data-invalid={hasError} className="gap-2">
                      <FieldLabel>
                        Due date{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FieldLabel>
                      <FieldContent>
                        <Popover
                          open={calendarOpen}
                          onOpenChange={setCalendarOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start gap-2 font-normal"
                            >
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span
                                className={
                                  field.state.value
                                    ? ""
                                    : "text-muted-foreground"
                                }
                              >
                                {field.state.value
                                  ? format(
                                      parseISO(field.state.value),
                                      "d MMM yyyy",
                                    )
                                  : "Pick a date"}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                field.state.value
                                  ? parseISO(field.state.value)
                                  : undefined
                              }
                              onSelect={(date) => {
                                field.handleChange(
                                  date ? format(date, "yyyy-MM-dd") : null,
                                );
                                setCalendarOpen(false);
                              }}
                            />
                            {field.state.value && (
                              <div className="border-t border-border/50 p-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="w-full text-muted-foreground text-xs h-7"
                                  onClick={() => {
                                    field.handleChange(null);
                                    setCalendarOpen(false);
                                  }}
                                >
                                  Clear date
                                </Button>
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                      </FieldContent>
                    </Field>
                  </AnimateItem>
                );
              }}
            </form.Field>
          </div>

          <form.Field name="details">
            {(field) => {
              const hasError =
                Boolean(field.state.meta.errors.length) && attemptCount > 0;
              return (
                <AnimateItem
                  errors={field.state.meta.errors}
                  hasError={hasError}
                  attemptCount={attemptCount}
                >
                  <Field data-invalid={hasError} className="gap-2">
                    <FieldLabel>
                      Additional Items{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FieldLabel>
                    <FieldContent>
                      <Textarea
                        placeholder={
                          "- Item one\n- Item two\n**Bold text**, *italic*"
                        }
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        rows={3}
                      />
                    </FieldContent>
                    <p className="text-xs text-muted-foreground">
                      Supports markdown — **bold**, *italic*, - lists, 1.
                      numbered
                    </p>
                  </Field>
                </AnimateItem>
              );
            }}
          </form.Field>

          <div className="space-y-1.5">
            <Label>
              Assignees{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <form.Field name="assignees">
              {(field) => (
                <AssigneeField
                  value={field.state.value}
                  onChange={field.handleChange}
                  items={memberItems}
                />
              )}
            </form.Field>
          </div>
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
    </form>
  );
};

export default TaskForm;
