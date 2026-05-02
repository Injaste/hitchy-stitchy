import { useState, useMemo, type FC } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import AssigneeField from "@/pages/admin/components/AssigneeField";
import { useRolesQuery } from "@/pages/admin/roles/queries";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogBody, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { timelineItemFormSchema, type TimelineItemFormValues } from "../types";
import { generateEventDays } from "../utils";
import { useTimelineQuery } from "../queries";
import LabelCombobox from "../components/LabelCombobox";
import { Separator } from "@/components/ui/separator";

interface TimelineItemFormProps {
  defaultValues?: Partial<TimelineItemFormValues>;
  onSubmit: (values: TimelineItemFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

const TimelineItemForm: FC<TimelineItemFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}) => {
  const { dateStart, dateEnd } = useAdminStore();
  const { data: roles = [] } = useRolesQuery();
  const { data: timelineData } = useTimelineQuery();
  const labelDays = timelineData?.days ?? [];
  const labelOptions = timelineData?.labels ?? [];
  const [attemptCount, setAttemptCount] = useState(0);

  const roleItems = roles.map((r) => ({ id: r.id, label: r.name }));

  const eventDays = useMemo(() => {
    if (!dateStart || !dateEnd) return [];
    return generateEventDays(dateStart, dateEnd);
  }, [dateStart, dateEnd]);

  const form = useForm({
    defaultValues: {
      day: defaultValues?.day ?? "",
      label: defaultValues?.label ?? "",
      time_start: defaultValues?.time_start ?? "",
      time_end: defaultValues?.time_end ?? "",
      title: defaultValues?.title ?? "",
      details: defaultValues?.details ?? "",
      assignees: defaultValues?.assignees ?? [],
    },
    validators: {
      onSubmit: timelineItemFormSchema,
      onChange: timelineItemFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(timelineItemFormSchema.parse(value));
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAttemptCount((prev) => prev + 1);
    form.handleSubmit();
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
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
                        placeholder="e.g. Bridal prep"
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
                      <LabelCombobox
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        days={labelDays}
                        labels={labelOptions}
                        placeholder="e.g. Nikah, Sanding"
                      />
                    </FieldContent>
                  </Field>
                </AnimateItem>
              );
            }}
          </form.Field>

          <form.Field name="day">
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
                    <FieldLabel>Day</FieldLabel>
                    <FieldContent>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger className="w-full">
                          {field.state.value ? (
                            <SelectValue />
                          ) : (
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <CalendarIcon className="size-4 shrink-0" />
                              <span>Select a day</span>
                            </span>
                          )}
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {eventDays.map((d) => {
                            const val = format(d, "yyyy-MM-dd");
                            return (
                              <SelectItem key={val} value={val}>
                                <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                                {format(d, "d MMM yyyy (EEE)")}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>
                </AnimateItem>
              );
            }}
          </form.Field>

          <div className="grid grid-cols-2 gap-3">
            <form.Field name="time_start">
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
                      <FieldLabel>Start time</FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupAddon>
                            <Clock className="size-4" />
                          </InputGroupAddon>
                          <InputGroupInput
                            type="time"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            className="[&::-webkit-calendar-picker-indicator]:hidden"
                          />
                        </InputGroup>
                      </FieldContent>
                    </Field>
                  </AnimateItem>
                );
              }}
            </form.Field>

            <form.Field name="time_end">
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
                        End time{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupAddon>
                            <Clock className="size-4" />
                          </InputGroupAddon>
                          <InputGroupInput
                            type="time"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            className="[&::-webkit-calendar-picker-indicator]:hidden"
                          />
                        </InputGroup>
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

          <form.Field name="assignees">
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
                      Assigned roles{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FieldLabel>
                    <p className="text-xs text-muted-foreground -mt-1">
                      Which roles are responsible for this item?
                    </p>
                    <FieldContent>
                      <AssigneeField
                        value={field.state.value}
                        onChange={field.handleChange}
                        items={roleItems}
                      />
                    </FieldContent>
                  </Field>
                </AnimateItem>
              );
            }}
          </form.Field>
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

export default TimelineItemForm;
