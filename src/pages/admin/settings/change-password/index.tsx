import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { FieldGroup } from "@/components/ui/field";
import {
  FormCard,
  FormHeader,
  FormBody,
  FormFooter,
  PasswordField,
} from "@/components/custom/form";
import { AnimateItem } from "@/components/animations/forms/field-animate";

import { useChangePasswordMutation } from "./queries";
import { changePasswordSchema } from "./types";

const ChangePassword = () => {
  const {
    mutateAsync: changePassword,
    isPending,
    isSuccess,
    isError,
    error: mutationError,
    reset: resetMutation,
  } = useChangePasswordMutation();

  const form = useForm({
    defaultValues: { password: "", confirm_password: "" },
    validators: {
      onSubmit: changePasswordSchema,
      onChange: changePasswordSchema,
    },
    onSubmit: async ({ value }) => {
      resetMutation();
      await changePassword({ password: value.password });
      toast.success("Password updated.");
    },
  });

  return (
    <FormCard
      form={form}
      isPending={isPending}
      isSuccess={isSuccess}
      isError={isError}
      resetOnSuccess
      className="max-w-sm"
    >
      <FormHeader title="Change Password" />

      <FormBody>
        <FieldGroup>
          <PasswordField
            name="password"
            label="New password"
            placeholder="New password"
            autoComplete="new-password"
          />
          <PasswordField
            name="confirm_password"
            label="Confirm new password"
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
          <form.Subscribe selector={(s) => s.submissionAttempts}>
            {(attempts) => (
              <AnimateItem
                hasError={Boolean(mutationError)}
                error={mutationError}
                attemptCount={attempts}
              />
            )}
          </form.Subscribe>
        </FieldGroup>
      </FormBody>

      <FormFooter submitLabel="Update password" />
    </FormCard>
  );
};

export default ChangePassword;
