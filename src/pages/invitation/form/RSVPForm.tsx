import { useForm } from "@tanstack/react-form";
import { Users, Phone, User, Mail, Utensils, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { FieldGroup } from "@/components/ui/field";

import { buildRsvpSchema, type RSVPFormData } from "../types";
import type { RSVPFormConfig } from "@/pages/admin/features/settings/types";
import { RSVPField } from "./RSVPField";

const RSVPForm = ({
  defaultValues: propsDefaults,
  onSubmit,
  onCancel,
  isEditing,
  rsvpConfig,
}: {
  defaultValues?: Partial<RSVPFormData>;
  onSubmit: (value: RSVPFormData) => Promise<void>;
  onCancel?: () => void;
  isEditing: boolean;
  rsvpConfig: RSVPFormConfig;
}) => {
  const schema = buildRsvpSchema(rsvpConfig);

  const builtDefaults: RSVPFormData = {
    name: "",
    ...(rsvpConfig.fields.phone.visible && { phone: "" }),
    ...(rsvpConfig.fields.email?.visible && { email: "" }),
    ...(rsvpConfig.fields.guestsCount.visible && { guestsCount: rsvpConfig.guestMin }),
    ...(rsvpConfig.fields.dietaryNotes.visible && { dietaryNotes: "" }),
    ...(rsvpConfig.fields.message.visible && { message: "" }),
  };

  const defaultValues: RSVPFormData = { ...builtDefaults, ...propsDefaults };

  const form = useForm({
    defaultValues,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      await onSubmit(value as RSVPFormData);
    },
  });

  let fieldIndex = 0;

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
        {(() => {
          const delay = fieldIndex++ * 0.1;
          return (
            <form.Field name="name">
              {(f) => (
                <RSVPField
                  delay={delay}
                  label="Full Name"
                  required
                  isInvalid={f.state.meta.isTouched && !f.state.meta.isValid}
                  errors={f.state.meta.errors}
                >
                  <InputGroup className="gap-1 h-12 rounded-full bg-muted/40 border-border px-1.5">
                    <InputGroupInput
                      id={f.name}
                      name={f.name}
                      type="text"
                      value={f.state.value as string}
                      onChange={(e) => f.handleChange(e.target.value)}
                      onBlur={f.handleBlur}
                      aria-invalid={f.state.meta.isTouched && !f.state.meta.isValid}
                      placeholder="e.g. Ahmad Bin Ali"
                      autoComplete="off"
                      className="rounded-tr-full rounded-br-full text-sm focus-visible:ring-primary focus-visible:border-primary bg-transparent border-0"
                    />
                    <InputGroupAddon className="mt-0.5">
                      <User size={15} className="text-primary/40" />
                    </InputGroupAddon>
                  </InputGroup>
                </RSVPField>
              )}
            </form.Field>
          );
        })()}

        {/* Phone — conditional */}
        {rsvpConfig.fields.phone.visible && (() => {
          const delay = fieldIndex++ * 0.1;
          return (
            <form.Field name="phone">
              {(f) => (
                <RSVPField
                  delay={delay}
                  label="Phone Number"
                  required={rsvpConfig.fields.phone.required}
                  isInvalid={f.state.meta.isTouched && !f.state.meta.isValid}
                  errors={f.state.meta.errors}
                >
                  <InputGroup className="gap-1 h-12 rounded-full bg-muted/40 border-border px-1.5">
                    <InputGroupInput
                      id={f.name}
                      name={f.name}
                      type="tel"
                      inputMode="numeric"
                      value={(f.state.value as string | undefined) ?? ""}
                      onChange={(e) => f.handleChange(e.target.value)}
                      onBlur={f.handleBlur}
                      aria-invalid={f.state.meta.isTouched && !f.state.meta.isValid}
                      placeholder="+65 9123 4567"
                      className="rounded-tr-full rounded-br-full text-sm focus-visible:ring-primary focus-visible:border-primary bg-transparent border-0"
                    />
                    <InputGroupAddon className="mt-0.5">
                      <Phone size={15} className="text-primary/40" />
                    </InputGroupAddon>
                  </InputGroup>
                </RSVPField>
              )}
            </form.Field>
          );
        })()}

        {/* Email — conditional */}
        {rsvpConfig.fields.email?.visible && (() => {
          const delay = fieldIndex++ * 0.1;
          return (
            <form.Field name="email">
              {(f) => (
                <RSVPField
                  delay={delay}
                  label="Email Address"
                  required={!!rsvpConfig.fields.email!.required}
                  isInvalid={f.state.meta.isTouched && !f.state.meta.isValid}
                  errors={f.state.meta.errors}
                >
                  <InputGroup className="gap-1 h-12 rounded-full bg-muted/40 border-border px-1.5">
                    <InputGroupInput
                      id={f.name}
                      name={f.name}
                      type="email"
                      value={(f.state.value as string | undefined) ?? ""}
                      onChange={(e) => f.handleChange(e.target.value)}
                      onBlur={f.handleBlur}
                      aria-invalid={f.state.meta.isTouched && !f.state.meta.isValid}
                      placeholder="e.g. ahmad@email.com"
                      className="rounded-tr-full rounded-br-full text-sm focus-visible:ring-primary focus-visible:border-primary bg-transparent border-0"
                    />
                    <InputGroupAddon className="mt-0.5">
                      <Mail size={15} className="text-primary/40" />
                    </InputGroupAddon>
                  </InputGroup>
                </RSVPField>
              )}
            </form.Field>
          );
        })()}

        {/* Guests — conditional */}
        {rsvpConfig.fields.guestsCount.visible && (() => {
          const delay = fieldIndex++ * 0.1;
          return (
            <form.Field name="guestsCount">
              {(f) => (
                <RSVPField
                  delay={delay}
                  label="Number of Guests"
                  required={rsvpConfig.fields.guestsCount.required}
                  isInvalid={f.state.meta.isTouched && !f.state.meta.isValid}
                  errors={f.state.meta.errors}
                >
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
                      onBlur={f.handleBlur}
                      aria-invalid={f.state.meta.isTouched && !f.state.meta.isValid}
                      placeholder={`1 – ${rsvpConfig.guestMax}`}
                      className="rounded-tr-full rounded-br-full text-sm focus-visible:ring-primary focus-visible:border-primary bg-transparent border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <InputGroupAddon className="mt-0.5">
                      <Users size={15} className="text-primary/40" />
                    </InputGroupAddon>
                  </InputGroup>
                </RSVPField>
              )}
            </form.Field>
          );
        })()}

        {/* Dietary Notes — conditional */}
        {rsvpConfig.fields.dietaryNotes.visible && (() => {
          const delay = fieldIndex++ * 0.1;
          return (
            <form.Field name="dietaryNotes">
              {(f) => (
                <RSVPField
                  delay={delay}
                  label="Dietary Requirements"
                  required={rsvpConfig.fields.dietaryNotes.required}
                  isInvalid={f.state.meta.isTouched && !f.state.meta.isValid}
                  errors={f.state.meta.errors}
                >
                  <InputGroup className="gap-1 rounded-2xl bg-muted/40 border-border px-1.5">
                    <InputGroupAddon className="self-start mt-2.5">
                      <Utensils size={15} className="text-primary/40" />
                    </InputGroupAddon>
                    <InputGroupTextarea
                      id={f.name}
                      name={f.name}
                      rows={2}
                      value={(f.state.value as string | undefined) ?? ""}
                      onChange={(e) => f.handleChange(e.target.value)}
                      onBlur={f.handleBlur}
                      aria-invalid={f.state.meta.isTouched && !f.state.meta.isValid}
                      placeholder="Any dietary requirements or allergies?"
                      className="text-sm focus-visible:ring-primary focus-visible:border-primary rounded-r-2xl"
                    />
                  </InputGroup>
                </RSVPField>
              )}
            </form.Field>
          );
        })()}

        {/* Message — conditional */}
        {rsvpConfig.fields.message.visible && (() => {
          const delay = fieldIndex++ * 0.1;
          return (
            <form.Field name="message">
              {(f) => (
                <RSVPField
                  delay={delay}
                  label="Message"
                  required={rsvpConfig.fields.message.required}
                  isInvalid={f.state.meta.isTouched && !f.state.meta.isValid}
                  errors={f.state.meta.errors}
                >
                  <InputGroup className="gap-1 rounded-2xl bg-muted/40 border-border px-1.5">
                    <InputGroupAddon className="self-start mt-2.5">
                      <MessageSquare size={15} className="text-primary/40" />
                    </InputGroupAddon>
                    <InputGroupTextarea
                      id={f.name}
                      name={f.name}
                      rows={2}
                      value={(f.state.value as string | undefined) ?? ""}
                      onChange={(e) => f.handleChange(e.target.value)}
                      onBlur={f.handleBlur}
                      aria-invalid={f.state.meta.isTouched && !f.state.meta.isValid}
                      placeholder="Leave us a message"
                      className="text-sm focus-visible:ring-primary focus-visible:border-primary rounded-r-2xl"
                    />
                  </InputGroup>
                </RSVPField>
              )}
            </form.Field>
          );
        })()}
      </FieldGroup>

      {/* Actions */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 14 }, show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: d, ease: [0.16, 1, 0.3, 1] } }) }}
        custom={fieldIndex * 0.1}
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
