import { useForm } from "@tanstack/react-form";
import {
  Users,
  Phone,
  User,
  Mail,
  Utensils,
  MessageSquare,
} from "lucide-react";
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
  InputGroupTextarea,
} from "@/components/ui/input-group";

import { buildRsvpSchema, type RSVPFormData } from "../types";

const fieldVariant: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

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
  rsvpConfig: any;
}) => {
  const schema = buildRsvpSchema(rsvpConfig);

  const builtDefaults: RSVPFormData = {
    name: "",
    ...(rsvpConfig.fields.phone.visible && { phone: "" }),
    ...(rsvpConfig.fields.email?.visible && { email: "" }),
    ...(rsvpConfig.fields.guestsCount.visible && {
      guestsCount: rsvpConfig.guestMin,
    }),
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
            <motion.div variants={fieldVariant} custom={delay}>
              <form.Field name="name">
                {(f) => {
                  const isInvalid =
                    f.state.meta.isTouched && !f.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel
                        htmlFor={f.name}
                        className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                      >
                        Full Name
                        <span className="text-destructive ml-0.5">*</span>
                      </FieldLabel>
                      <InputGroup className="gap-1 h-12 rounded-full bg-muted/40 border-border px-1.5">
                        <InputGroupInput
                          id={f.name}
                          name={f.name}
                          type="text"
                          value={f.state.value as string}
                          onChange={(e) => f.handleChange(e.target.value)}
                          onBlur={f.handleBlur}
                          aria-invalid={isInvalid}
                          placeholder="e.g. Ahmad Bin Ali"
                          autoComplete="off"
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
          );
        })()}

        {/* Phone — conditional */}
        {rsvpConfig.fields.phone.visible &&
          (() => {
            const delay = fieldIndex++ * 0.1;
            return (
              <motion.div variants={fieldVariant} custom={delay}>
                <form.Field name="phone">
                  {(f) => {
                    const isInvalid =
                      f.state.meta.isTouched && !f.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel
                          htmlFor={f.name}
                          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                        >
                          Phone Number
                          {rsvpConfig.fields.phone.required ? (
                            <span className="text-destructive ml-0.5">*</span>
                          ) : (
                            <span className="ml-1 normal-case tracking-normal font-normal">
                              (Optional)
                            </span>
                          )}
                        </FieldLabel>
                        <InputGroup className="gap-1 h-12 rounded-full bg-muted/40 border-border px-1.5">
                          <InputGroupInput
                            id={f.name}
                            name={f.name}
                            type="tel"
                            inputMode="numeric"
                            value={(f.state.value as string | undefined) ?? ""}
                            onChange={(e) => f.handleChange(e.target.value)}
                            onBlur={f.handleBlur}
                            aria-invalid={isInvalid}
                            placeholder="+65 9123 4567"
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
            );
          })()}

        {/* Email — conditional */}
        {rsvpConfig.fields.email?.visible &&
          (() => {
            const delay = fieldIndex++ * 0.1;
            return (
              <motion.div variants={fieldVariant} custom={delay}>
                <form.Field name="email">
                  {(f) => {
                    const isInvalid =
                      f.state.meta.isTouched && !f.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel
                          htmlFor={f.name}
                          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                        >
                          Email Address
                          {rsvpConfig.fields.email!.required ? (
                            <span className="text-destructive ml-0.5">*</span>
                          ) : (
                            <span className="ml-1 normal-case tracking-normal font-normal">
                              (Optional)
                            </span>
                          )}
                        </FieldLabel>
                        <InputGroup className="gap-1 h-12 rounded-full bg-muted/40 border-border px-1.5">
                          <InputGroupInput
                            id={f.name}
                            name={f.name}
                            type="email"
                            value={(f.state.value as string | undefined) ?? ""}
                            onChange={(e) => f.handleChange(e.target.value)}
                            onBlur={f.handleBlur}
                            aria-invalid={isInvalid}
                            placeholder="e.g. ahmad@email.com"
                            className="rounded-tr-full rounded-br-full text-sm focus-visible:ring-primary focus-visible:border-primary bg-transparent border-0"
                          />
                          <InputGroupAddon className="mt-0.5">
                            <Mail size={15} className="text-primary/40" />
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
            );
          })()}

        {/* Guests — conditional */}
        {rsvpConfig.fields.guestsCount.visible &&
          (() => {
            const delay = fieldIndex++ * 0.1;
            return (
              <motion.div variants={fieldVariant} custom={delay}>
                <form.Field name="guestsCount">
                  {(f) => {
                    const isInvalid =
                      f.state.meta.isTouched && !f.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel
                          htmlFor={f.name}
                          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                        >
                          Number of Guests
                          {rsvpConfig.fields.guestsCount.required ? (
                            <span className="text-destructive ml-0.5">*</span>
                          ) : (
                            <span className="ml-1 normal-case tracking-normal font-normal">
                              (Optional)
                            </span>
                          )}
                        </FieldLabel>
                        <InputGroup className="gap-1 h-12 rounded-full bg-muted/40 border-border px-1.5">
                          <InputGroupInput
                            id={f.name}
                            name={f.name}
                            type="number"
                            inputMode="numeric"
                            min={rsvpConfig.guestMin}
                            max={rsvpConfig.guestMax}
                            value={
                              (f.state.value as number | undefined) ??
                              rsvpConfig.guestMin
                            }
                            onChange={(e) =>
                              f.handleChange(Number(e.target.value))
                            }
                            onBlur={f.handleBlur}
                            aria-invalid={isInvalid}
                            placeholder={`1 – ${rsvpConfig.guestMax}`}
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
            );
          })()}

        {/* Dietary Notes — conditional */}
        {rsvpConfig.fields.dietaryNotes.visible &&
          (() => {
            const delay = fieldIndex++ * 0.1;
            return (
              <motion.div variants={fieldVariant} custom={delay}>
                <form.Field name="dietaryNotes">
                  {(f) => {
                    const isInvalid =
                      f.state.meta.isTouched && !f.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel
                          htmlFor={f.name}
                          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                        >
                          Dietary Requirements
                          {rsvpConfig.fields.dietaryNotes.required ? (
                            <span className="text-destructive ml-0.5">*</span>
                          ) : (
                            <span className="ml-1 normal-case tracking-normal font-normal">
                              (Optional)
                            </span>
                          )}
                        </FieldLabel>
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
                            aria-invalid={isInvalid}
                            placeholder="Any dietary requirements or allergies?"
                            className="text-sm focus-visible:ring-primary focus-visible:border-primary rounded-r-2xl"
                          />
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
            );
          })()}

        {/* Message — conditional */}
        {rsvpConfig.fields.message.visible &&
          (() => {
            const delay = fieldIndex++ * 0.1;
            return (
              <motion.div variants={fieldVariant} custom={delay}>
                <form.Field name="message">
                  {(f) => {
                    const isInvalid =
                      f.state.meta.isTouched && !f.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel
                          htmlFor={f.name}
                          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                        >
                          Message
                          {rsvpConfig.fields.message.required ? (
                            <span className="text-destructive ml-0.5">*</span>
                          ) : (
                            <span className="ml-1 normal-case tracking-normal font-normal">
                              (Optional)
                            </span>
                          )}
                        </FieldLabel>
                        <InputGroup className="gap-1 rounded-2xl bg-muted/40 border-border px-1.5">
                          <InputGroupAddon className="self-start mt-2.5">
                            <MessageSquare
                              size={15}
                              className="text-primary/40"
                            />
                          </InputGroupAddon>
                          <InputGroupTextarea
                            id={f.name}
                            name={f.name}
                            rows={2}
                            value={(f.state.value as string | undefined) ?? ""}
                            onChange={(e) => f.handleChange(e.target.value)}
                            onBlur={f.handleBlur}
                            aria-invalid={isInvalid}
                            placeholder="Leave us a message"
                            className="text-sm focus-visible:ring-primary focus-visible:border-primary rounded-r-2xl"
                          />
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
            );
          })()}
      </FieldGroup>

      {/* Actions */}
      <motion.div
        variants={fieldVariant}
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
            className="h-12 rounded-full text-xs font-bold text-muted-foreground uppercase tracking-widest hover:bg-primary/10"
          >
            Cancel
          </motion.button>
        )}
      </motion.div>
    </motion.form>
  );
};

export default RSVPForm;
