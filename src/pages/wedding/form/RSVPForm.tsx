import { useForm } from "@tanstack/react-form";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { fieldVariant } from "@/lib/animations";

import { FieldGroup } from "@/components/ui/field";
import { buildRsvpSchema, type RSVPFormData } from "@/pages/wedding/types";

import type { RSVPFormProps } from "./types";
import NameField from "./fields/NameField";
import PhoneField from "./fields/PhoneField";
import CodeField from "./fields/CodeField";
import GuestCountField from "./fields/GuestCountField";
import MessageField from "./fields/MessageField";
import SubmitButton from "./actions/SubmitButton";
import CancelButton from "./actions/CancelButton";

const RSVPForm = ({
  defaultValues: propsDefaults,
  onSubmit,
  onCancel,
  isEditing,
  rsvpConfig,
  limits,
  showCode = false,
  error,
  classNames,
  labels,
}: RSVPFormProps) => {
  const { message } = rsvpConfig.fields;

  // The code is only relevant for a new (non-edit) gated submission; self-edits
  // re-authenticate by token, not the code. When shown, it's always required.
  const codeVisible = showCode && !isEditing;

  // Sequential reveal: code (when shown) sits right after phone and pushes the
  // remaining fields down by one.
  const base = codeVisible ? 1 : 0;
  const delays = {
    name: 0,
    phone: 1,
    code: codeVisible ? 2 : null,
    guestCount: 2 + base,
    message: message.visible ? 3 + base : null,
  };
  const submitDelay = (message.visible ? 4 : 3) + base;

  const form = useForm({
    defaultValues: {
      name: "",
      phone: "",
      guestCount: limits.min,
      ...(message.visible && { message: "" }),
      ...(codeVisible && { code: "" }),
      ...propsDefaults,
    } as RSVPFormData,
    validators: { onSubmit: buildRsvpSchema(rsvpConfig, limits, codeVisible) },
    onSubmit: async ({ value }) => {
      await onSubmit(value as RSVPFormData);
    },
  });

  return (
    <motion.form
      initial="hidden"
      animate="show"
      className={classNames.form}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup className={classNames.fieldGroup}>
        <form.Field name="name">
          {(f) => (
            <NameField
              field={{
                name: f.name,
                value: f.state.value as string,
                onChange: (v) => f.handleChange(v),
                onBlur: f.handleBlur,
                isInvalid: f.state.meta.isTouched && !f.state.meta.isValid,
                errors: f.state.meta.errors,
              }}
              required
              classNames={classNames}
              labels={labels}
              delay={delays.name * 0.1}
            />
          )}
        </form.Field>

        <form.Field name="phone">
          {(f) => (
            <PhoneField
              field={{
                name: f.name,
                value: (f.state.value as string | undefined) ?? "",
                onChange: (v) => f.handleChange(v),
                onBlur: f.handleBlur,
                isInvalid: f.state.meta.isTouched && !f.state.meta.isValid,
                errors: f.state.meta.errors,
              }}
              required
              classNames={classNames}
              labels={labels}
              delay={delays.phone * 0.1}
            />
          )}
        </form.Field>

        {codeVisible && (
          <form.Field name="code">
            {(f) => (
              <CodeField
                field={{
                  name: f.name,
                  value: (f.state.value as string | undefined) ?? "",
                  onChange: (v) => f.handleChange(v),
                  onBlur: f.handleBlur,
                  isInvalid: f.state.meta.isTouched && !f.state.meta.isValid,
                  errors: f.state.meta.errors,
                }}
                required
                classNames={classNames}
                labels={labels}
                delay={delays.code! * 0.1}
              />
            )}
          </form.Field>
        )}

        <form.Field name="guestCount">
          {(f) => (
            <GuestCountField
              field={{
                name: f.name,
                value: (f.state.value as number | undefined) ?? limits.min,
                onChange: (v) => f.handleChange(v),
                onBlur: f.handleBlur,
                isInvalid: f.state.meta.isTouched && !f.state.meta.isValid,
                errors: f.state.meta.errors,
                min: limits.min,
                max: limits.max,
              }}
              required
              classNames={classNames}
              labels={labels}
              delay={delays.guestCount * 0.1}
            />
          )}
        </form.Field>

        {message.visible && (
          <form.Field name="message">
            {(f) => (
              <MessageField
                field={{
                  name: f.name,
                  value: (f.state.value as string | undefined) ?? "",
                  onChange: (v) => f.handleChange(v),
                  onBlur: f.handleBlur,
                  isInvalid: f.state.meta.isTouched && !f.state.meta.isValid,
                  errors: f.state.meta.errors,
                }}
                required={message.required}
                classNames={classNames}
                labels={labels}
                delay={delays.message! * 0.1}
              />
            )}
          </form.Field>
        )}
      </FieldGroup>

      {error && (
        <p role="alert" className={classNames.formError}>
          {error}
        </p>
      )}

      <form.Subscribe selector={(s) => [s.isSubmitting, s.canSubmit]}>
        {([isSubmitting, canSubmit]) => (
          <motion.div
            variants={fieldVariant}
            custom={submitDelay * 0.1}
            className={classNames.actions}
          >
            <SubmitButton
              isEditing={isEditing}
              classNames={classNames}
              labels={labels}
              isSubmitting={isSubmitting as boolean}
              canSubmit={canSubmit as boolean}
            />
            {isEditing && onCancel && (
              <CancelButton
                onCancel={onCancel}
                classNames={classNames}
                labels={labels}
              />
            )}
          </motion.div>
        )}
      </form.Subscribe>

      <p className="text-xs text-muted-foreground text-center mt-3">
        Your details are only used to manage your RSVP.{" "}
        <Link to="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
      </p>
    </motion.form>
  );
};

export default RSVPForm;
