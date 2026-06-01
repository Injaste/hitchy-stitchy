import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { FieldGroup } from "@/components/ui/field";
import {
  FormCard,
  FormCardHeader,
  FormCardFooter,
  PasswordField,
} from "@/components/custom/form";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import Container from "@/components/custom/container";

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
    <>
      <AdminPageHeader title="Settings" description="Manage your account." />
      <Container pageSpacing className="max-w-sm">
        <FormCard
          form={form}
          isPending={isPending}
          isSuccess={isSuccess}
          isError={isError}
          resetOnSuccess
        >
          <FormCardHeader title="Change Password" />

          <div className="px-4">
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
          </div>

          <FormCardFooter submitLabel="Update password" />
        </FormCard>
      </Container>
    </>
  );
};

export default ChangePassword;
