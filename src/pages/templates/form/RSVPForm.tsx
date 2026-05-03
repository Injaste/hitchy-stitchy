import { useForm } from "@tanstack/react-form";
import { motion } from "framer-motion";

import { fieldVariant } from "./animations";

import { FieldGroup } from "@/components/ui/field";
import { buildRsvpSchema, type RSVPFormData } from "@/pages/templates/types";

import type { RSVPFormProps } from "./types";
import NameField from "./fields/NameField";
import PhoneField from "./fields/PhoneField";
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
  classNames,
  labels,
}: RSVPFormProps) => {
  const { message } = rsvpConfig.fields;

  const delays = {
    name: 0,
    phone: 1,
    guestCount: 2,
    message: message.visible ? 3 : null,
  };
  const submitDelay = message.visible ? 4 : 3;

  const form = useForm({
    defaultValues: {
      name: "",
      phone: "",
      guestCount: limits.min,
      ...(message.visible && { message: "" }),
      ...propsDefaults,
    } as RSVPFormData,
    validators: { onSubmit: buildRsvpSchema(rsvpConfig, limits) },
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
                optionalLabel={
                  !message.required ? labels.message.optional : undefined
                }
                classNames={classNames}
                labels={labels}
                delay={delays.message! * 0.1}
              />
            )}
          </form.Field>
        )}
      </FieldGroup>

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
    </motion.form>
  );
};

export default RSVPForm;
