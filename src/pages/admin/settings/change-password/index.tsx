import { useForm } from "@tanstack/react-form";
import { KeyRound } from "lucide-react";

import { FieldGroup } from "@/components/ui/field";
import {
  FormCard,
  FormHeader,
  FormBody,
  FormFooter,
  PasswordField,
  PasswordChecklist,
} from "@/components/custom/form";
import { isPasswordValid } from "@/lib/password";

// Schema + mutation are shared with the account-settings version (the form logic
// is identical — only the presentation differs: carded here, flush there).
import { useChangePasswordMutation } from "@/pages/account/components/change-password/queries";
import { changePasswordSchema } from "@/pages/account/components/change-password/types";

/** Admin-settings change password — carded, sits among the Settings tab cards. */
const ChangePassword = () => {
  const {
    mutateAsync: changePassword,
    isPending,
    isSuccess,
    isError,
  } = useChangePasswordMutation();

  const form = useForm({
    defaultValues: { password: "", confirm_password: "" },
    validators: {
      onSubmit: changePasswordSchema,
      onChange: changePasswordSchema,
    },
    onSubmit: async ({ value }) => {
      if (!isPasswordValid(value.password)) return;
      await changePassword({ password: value.password });
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
      <FormHeader
        icon={<KeyRound className="size-4" />}
        title="Change Password"
      />

      <FormBody>
        <FieldGroup>
          <div className="space-y-2">
            <PasswordField
              name="password"
              label="New password"
              placeholder="New password"
              autoComplete="new-password"
            />
            <PasswordChecklist name="password" />
          </div>
          <PasswordField
            name="confirm_password"
            label="Confirm new password"
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
        </FieldGroup>
      </FormBody>

      <form.Subscribe selector={(s) => s.values.password}>
        {(pw) => (
          <FormFooter
            submitLabel="Update password"
            submitDisabled={!isPasswordValid(pw)}
          />
        )}
      </form.Subscribe>
    </FormCard>
  );
};

export default ChangePassword;
