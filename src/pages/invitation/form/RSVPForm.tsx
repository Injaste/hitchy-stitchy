import { useForm } from "@tanstack/react-form";
import { Users, Phone, User } from "lucide-react";
import { motion, type Variants } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import { buildRsvpSchema, type RSVPFormData } from "../types";
import type { RSVPFormConfig } from "@/pages/admin/features/settings/types";

const fieldVariant: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

const RSVPForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isEditing,
  rsvpConfig,
}: {
  defaultValues: RSVPFormData;
  onSubmit: (value: RSVPFormData) => Promise<void>;
  onCancel?: () => void;
  isEditing: boolean;
  rsvpConfig: RSVPFormConfig;
}) => {
  const schema = buildRsvpSchema(rsvpConfig);

  const form = useForm({
    defaultValues,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <motion.form
      initial="hidden"
      animate="show"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        {/* Name — always visible */}
        <motion.div variants={fieldVariant} custom={0}>
          <form.Field name="name">
            {(f) => {
              const isInvalid = f.state.meta.isTouched && !f.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={f.name}
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Full Name
                  </FieldLabel>
                  <InputGroup className="gap-1 h-12 rounded-full bg-muted/40 border-border px-1.5">
                    <InputGroupInput
                      id={f.name}
                      name={f.name}
                      value={f.state.value as string}
                      onChange={(e) => f.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="e.g. Izhan Danish"
                      autoComplete="new-password"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute("readonly")}
                      onBlur={(e) => {
                        e.target.setAttribute("readonly", "true");
                        f.handleBlur();
                      }}
                      className="rounded-tr-full rounded-br-full text-sm focus-visible:ring-primary focus-visible:border-primary bg-transparent border-0"
                    />
                    <InputGroupAddon className="mt-0.5">
                      <User size={15} className="text-primary/40" />
                    </InputGroupAddon>
                  </InputGroup>
                  {isInvalid && (
                    <FieldError
                      errors={f.state.meta.errors}
                      className="text-[10px] font-bold uppercase tracking-wide"
                    />
                  )}
                </Field>
              );
            }}
          </form.Field>
        </motion.div>

        {/* Phone — conditional */}
        {rsvpConfig.fields.phone.visible && (
          <motion.div variants={fieldVariant} custom={0.1}>
            <form.Field name="phoneNumber">
              {(f) => {
                const isInvalid = f.state.meta.isTouched && !f.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel
                      htmlFor={f.name}
                      className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                    >
                      Phone Number
                    </FieldLabel>
                    <InputGroup className="gap-1 h-12 rounded-full bg-muted/40 border-border px-1.5">
                      <InputGroupInput
                        id={f.name}
                        name={f.name}
                        type="tel"
                        inputMode="numeric"
                        value={(f.state.value as string | undefined) ?? ""}
                        onChange={(e) => f.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="e.g. 81234567"
                        autoComplete="new-password"
                        readOnly
                        onFocus={(e) => e.target.removeAttribute("readonly")}
                        onBlur={(e) => {
                          e.target.setAttribute("readonly", "true");
                          f.handleBlur();
                        }}
                        className="rounded-tr-full rounded-br-full text-sm focus-visible:ring-primary focus-visible:border-primary bg-transparent border-0"
                      />
                      <InputGroupAddon className="mt-0.5">
                        <Phone size={15} className="text-primary/40" />
                      </InputGroupAddon>
                    </InputGroup>
                    {isInvalid && (
                      <FieldError
                        errors={f.state.meta.errors}
                        className="text-[10px] font-bold uppercase tracking-wide"
                      />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </motion.div>
        )}

        {/* Guests — conditional */}
        {rsvpConfig.fields.guestsCount.visible && (
          <motion.div variants={fieldVariant} custom={0.2}>
            <form.Field name="guestsCount">
              {(f) => {
                const isInvalid = f.state.meta.isTouched && !f.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel
                      htmlFor={f.name}
                      className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                    >
                      Number of Guests
                    </FieldLabel>
                    <InputGroup className="gap-1 h-12 rounded-full bg-muted/40 border-border px-1.5">
                      <InputGroupInput
                        id={f.name}
                        name={f.name}
                        type="number"
                        inputMode="numeric"
                        min={rsvpConfig.guestMin}
                        max={rsvpConfig.guestMax}
                        value={(f.state.value as number | undefined) ?? rsvpConfig.guestMin}
                        onChange={(e) => f.handleChange(Number(e.target.value))}
                        aria-invalid={isInvalid}
                        placeholder="e.g. 2"
                        autoComplete="new-password"
                        readOnly
                        onFocus={(e) => e.target.removeAttribute("readonly")}
                        onBlur={(e) => {
                          e.target.setAttribute("readonly", "true");
                          f.handleBlur();
                        }}
                        className="rounded-tr-full rounded-br-full text-sm focus-visible:ring-primary focus-visible:border-primary bg-transparent border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <InputGroupAddon className="mt-0.5">
                        <Users size={15} className="text-primary/40" />
                      </InputGroupAddon>
                    </InputGroup>
                    {isInvalid && (
                      <FieldError
                        errors={f.state.meta.errors}
                        className="text-[10px] font-bold uppercase tracking-wide"
                      />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </motion.div>
        )}
      </FieldGroup>

      {/* Actions */}
      <motion.div
        variants={fieldVariant}
        custom={0.3}
        className="flex flex-col gap-2.5 pt-2"
      >
        <form.Subscribe selector={(s) => [s.isSubmitting, s.canSubmit]}>
          {([isSubmitting, canSubmit]) => (
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs sm:text-sm shadow-lg hover:bg-primary/90 disabled:opacity-60 transition-all mt-8"
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting
                ? "Sending Love..."
                : isEditing
                  ? "Update RSVP"
                  : "Confirm Attendance"}
            </motion.button>
          )}
        </form.Subscribe>

        {isEditing && onCancel && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="h-12 rounded-full text-[11px] font-bold text-muted-foreground uppercase tracking-widest hover:bg-primary/10"
          >
            Cancel
          </motion.button>
        )}
      </motion.div>
    </motion.form>
  );
};

export default RSVPForm;
