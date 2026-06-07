import type { FC } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { Heart, CalendarCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FieldGroup } from "@/components/ui/field";
import { AnimatePresence, motion } from "framer-motion";
import {
  FormShell,
  TextField,
  FieldShell,
  FormError,
  SubmitButton,
} from "@/components/custom/form";
import {
  stepRoleSchema,
  type StepRoleFormValues,
  type CreateRoleData,
  type StepType,
} from "../../types";
import { useSteps } from "@/components/custom/steps-direction";

// ─── Constants ────────────────────────────────────────────────────────────────

interface RoleOption {
  role: CreateRoleData["role_name"];
  icon: React.ComponentType<{ className?: string }>;
}

const ROLE_OPTIONS: RoleOption[] = [
  { role: "Bride", icon: Heart },
  { role: "Groom", icon: Heart },
  { role: "Coordinator", icon: CalendarCheck },
  { role: "Other", icon: User },
];

// ─── Form hook ────────────────────────────────────────────────────────────────

interface UseStepRoleFormOpts {
  defaultValues?: Partial<StepRoleFormValues>;
  onSubmit: (values: StepRoleFormValues) => void;
}

export const useStepRoleForm = ({
  defaultValues,
  onSubmit,
}: UseStepRoleFormOpts) =>
  useForm({
    defaultValues: {
      role: defaultValues?.role ?? "",
      customRole: defaultValues?.customRole ?? "",
    },
    validators: {
      onSubmit: stepRoleSchema,
      onChange: stepRoleSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

// ─── Component ────────────────────────────────────────────────────────────────

interface StepRoleProps {
  defaultValues?: Partial<CreateRoleData>;
  onSubmit: (data: CreateRoleData) => void;
  onBack: (data: Partial<CreateRoleData>) => void;
  isSubmitting?: boolean;
  error?: Error | null;
}

const StepRole: FC<StepRoleProps> = ({
  defaultValues,
  onSubmit,
  onBack,
  isSubmitting,
  error,
}) => {
  const { goTo } = useSteps<StepType>();

  const isCustomDefault =
    defaultValues?.role_name &&
    !ROLE_OPTIONS.find((o) => o.role === defaultValues.role_name);

  const form = useStepRoleForm({
    defaultValues: {
      role: isCustomDefault ? "Other" : (defaultValues?.role_name ?? ""),
      customRole: isCustomDefault ? defaultValues!.role_name : "",
    },
    onSubmit: (value) => {
      if (value.role === "Other") {
        onSubmit({ role_name: value.customRole.trim() });
      } else {
        onSubmit({ role_name: value.role });
      }
    },
  });

  const role = useStore(form.store, (s) => s.values.role);
  const formIsSubmitting = useStore(form.store, (s) => s.isSubmitting);

  const handleBack = () => {
    const values = form.state.values;
    const currentRole =
      values.role === "Other" ? values.customRole?.trim() : values.role;
    onBack({ role_name: currentRole || undefined });
    goTo("Event");
  };

  return (
    <FormShell form={form} className="space-y-6">
      <div>
        <h3 className="font-semibold text-base text-foreground">
          What's your role?
        </h3>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          You can add more team members after setup.
        </p>
      </div>

      <FieldGroup>
        {/* Bespoke: icon-card grid per option — a generic RadioField can't express
            this layout without a custom render prop, which is just FieldShell again. */}
        <FieldShell name="role" label="Role">
          {(field) => (
            <RadioGroup
              value={field.state.value}
              onValueChange={(val) => {
                field.handleChange(val);
                field.handleBlur();
              }}
              className="grid grid-cols-2 gap-4"
            >
              {ROLE_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <label
                    key={option.role}
                    htmlFor={option.role}
                    onClick={
                      option.role === "Other" && field.state.value === "Other"
                        ? () => {
                            requestAnimationFrame(() => {
                              document
                                .querySelector<HTMLInputElement>(
                                  '[name="customRole"]',
                                )
                                ?.focus();
                            });
                          }
                        : undefined
                    }
                    className="flex h-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-input px-3 py-4 text-sm text-muted-foreground transition-all active:scale-[0.95] has-[[data-state=unchecked]]:hover:bg-accent has-[[data-state=unchecked]]:hover:text-accent-foreground has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10 has-[[data-state=checked]]:text-primary"
                  >
                    <Icon className="size-5 shrink-0" />
                    <span className="font-medium">{option.role}</span>
                    <RadioGroupItem
                      value={option.role}
                      id={option.role}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </RadioGroup>
          )}
        </FieldShell>

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
              <TextField
                name="customRole"
                label="Your Role"
                placeholder="e.g. Floor Manager"
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>

        <FormError error={error} />
      </FieldGroup>

      <div className="flex flex-col gap-3">
        <SubmitButton
          size="lg"
          isPending={formIsSubmitting || !!isSubmitting}
          isError={Boolean(error)}
          className="w-full"
        >
          Create Event
        </SubmitButton>
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={formIsSubmitting || !!isSubmitting}
          className="w-full text-muted-foreground"
        >
          Back
        </Button>
      </div>
    </FormShell>
  );
};

export default StepRole;
