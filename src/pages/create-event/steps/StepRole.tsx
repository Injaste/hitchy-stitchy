import { useState } from "react";
import type { FC } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Heart, CalendarCheck, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils/utils";
import type { CreateRoleData, StepType } from "../types";
import { useSteps } from "@/components/custom/steps";

interface StepRoleProps {
  defaultValues?: Partial<CreateRoleData>;
  onSubmit: (data: CreateRoleData) => void;
  onBack: (data: Partial<CreateRoleData>) => void;
  isSubmitting?: boolean;
  error?: Error | null;
}

interface RoleOption {
  role: string;
  shortRole: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLE_OPTIONS: RoleOption[] = [
  { role: "Bride", shortRole: "Bride", icon: Heart },
  { role: "Groom", shortRole: "Groom", icon: Heart },
  { role: "Coordinator", shortRole: "Coord", icon: CalendarCheck },
  { role: "Other", shortRole: "Other", icon: User },
];

const stepRoleSchema = z
  .object({
    role: z.string().min(1, "Please select a role to continue."),
    customRole: z.union([z.string(), z.undefined()]),
  })
  .refine(
    (val) => val.role !== "Other" || (val.customRole ?? "").trim().length > 0,
    { message: "Please enter your role.", path: ["customRole"] },
  );

const StepRole: FC<StepRoleProps> = ({
  defaultValues,
  onSubmit,
  onBack,
  isSubmitting,
  error,
}) => {
  const { goTo } = useSteps<StepType>();
  const [attemptCount, setAttemptCount] = useState(0);

  const isCustomDefault =
    defaultValues?.role_name &&
    !ROLE_OPTIONS.find((o) => o.role === defaultValues.role_name);

  const form = useForm({
    defaultValues: {
      role: isCustomDefault ? "Other" : (defaultValues?.role_name ?? ""),
      customRole: isCustomDefault ? defaultValues!.role_name : "",
    },
    validators: {
      onSubmit: stepRoleSchema,
      onChange: stepRoleSchema,
    },
    onSubmit: async ({ value }) => {
      if (value.role === "Other") {
        const trimmed = value.customRole!.trim();
        onSubmit({ role_name: trimmed, role_short_name: trimmed.slice(0, 10) });
      } else {
        const option = ROLE_OPTIONS.find((o) => o.role === value.role)!;
        onSubmit({ role_name: option.role, role_short_name: option.shortRole });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAttemptCount((prev) => prev + 1);
    form.handleSubmit();
  };

  const handleBack = () => {
    const values = form.state.values;
    const currentRole =
      values.role === "Other" ? values.customRole?.trim() : values.role;
    onBack({ role_name: currentRole || undefined });
    goTo("Event");
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-medium text-foreground">What's your role?</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          You can add more team members after setup.
        </p>
      </div>

      <FieldGroup className="block space-y-4">
        {/* Role picker */}
        <form.Field name="role">
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
                  <FieldLabel>Role</FieldLabel>
                  <FieldContent>
                    <RadioGroup
                      value={field.state.value}
                      onValueChange={(val) => {
                        field.handleChange(val);
                        field.handleBlur();
                      }}
                      className="grid grid-cols-2 gap-3"
                    >
                      {ROLE_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = field.state.value === option.role;
                        return (
                          <FieldLabel
                            key={option.role}
                            htmlFor={option.role}
                            className="relative cursor-pointer"
                          >
                            <Field
                              orientation="horizontal"
                              className="transition-colors hover:bg-muted/50"
                            >
                              <FieldContent className="flex flex-col items-center gap-2">
                                <Icon
                                  className={cn(
                                    "w-6 h-6",
                                    isSelected
                                      ? "text-primary"
                                      : "text-muted-foreground",
                                  )}
                                />
                                <FieldTitle
                                  className={cn(
                                    "text-sm font-medium",
                                    isSelected
                                      ? "text-primary"
                                      : "text-foreground",
                                  )}
                                >
                                  {option.role}
                                </FieldTitle>
                              </FieldContent>
                              <RadioGroupItem
                                value={option.role}
                                id={option.role}
                                className="absolute size-0 sr-only"
                              />
                            </Field>
                          </FieldLabel>
                        );
                      })}
                    </RadioGroup>
                  </FieldContent>
                </Field>
              </AnimateItem>
            );
          }}
        </form.Field>

        {/* Custom role input */}
        <form.Subscribe selector={(s) => s.values.role}>
          {(role) => (
            <AnimatePresence>
              {role === "Other" && (
                <motion.div
                  key="custom-role"
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                    transition: { duration: 0.2 },
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -4,
                    transition: { duration: 0.15 },
                  }}
                >
                  <form.Field name="customRole">
                    {(field) => {
                      const hasError =
                        Boolean(field.state.meta.errors.length) &&
                        attemptCount > 0;
                      return (
                        <AnimateItem
                          errors={field.state.meta.errors}
                          hasError={hasError}
                          attemptCount={attemptCount}
                        >
                          <Field data-invalid={hasError} className="gap-2">
                            <FieldLabel htmlFor="customRole">
                              Your Role
                            </FieldLabel>
                            <FieldContent>
                              <Input
                                id="customRole"
                                placeholder="e.g. Floor Manager"
                                autoFocus
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                onBlur={field.handleBlur}
                              />
                            </FieldContent>
                          </Field>
                        </AnimateItem>
                      );
                    }}
                  </form.Field>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </form.Subscribe>

        {/* Mutation error */}
        <AnimateItem
          hasError={Boolean(error)}
          error={error ?? undefined}
          attemptCount={attemptCount}
        />
      </FieldGroup>

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting_) => (
          <div className="flex flex-col gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting_ || isSubmitting}
              className="w-full"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting_ || isSubmitting}
              className="w-full"
            >
              {isSubmitting_ || isSubmitting
                ? "Creating your event…"
                : "Create Event"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
};

export default StepRole;
