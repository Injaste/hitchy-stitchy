import { useForm } from "@tanstack/react-form";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { fieldVariant } from "@/lib/animations";

import { FieldGroup } from "@/components/ui/field";
import Logo from "@/components/custom/logo";
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

      {/* Themed via currentColor (inherits the template's --xx-fg) so the legal
          text + brand attribution stay legible on every palette. */}
      <div className="mt-4 flex flex-col items-center gap-2 text-center">
        <p className="text-xs text-current/70">
          By submitting, you agree to our{" "}
          <Link to="/privacy" className="underline hover:text-current">
            Privacy Policy
          </Link>
          .
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded-xl border border-current/15 bg-current/5 px-3.5 py-2 text-current/65 transition-colors hover:border-current/30 hover:text-current/90"
        >
          <span className="text-2xs font-medium uppercase tracking-widest">
            Made with
          </span>
          <Logo direction="row" imageClassName="h-6 w-6" className="gap-0" />
          <span className="-ml-0.5 text-xs font-semibold tracking-wide">
            Hitchy Stitchy
          </span>
        </Link>
      </div>
    </motion.form>
  );
};

export default RSVPForm;
