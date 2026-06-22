import { useForm, useStore } from "@tanstack/react-form";

import { FieldGroup } from "@/components/ui/field";
import {
  FormShell,
  SubmitButton,
  PasswordField,
  PasswordChecklist,
} from "@/components/custom/form";
import { useSettingsLeaveGuard } from "@/components/custom/settings-dialog";
import { isPasswordValid } from "@/lib/password";

import { useChangePasswordMutation } from "./queries";
import { changePasswordSchema } from "./types";

/** Account-settings change password — flush (no card) for the settings modal.
 *  The admin Settings page has its own carded version. */
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
      form.reset(); // clear so the leave-guard doesn't flag an already-saved form
    },
  });

  // Let the settings dialog warn before discarding a half-typed password.
  const isDirty = useStore(form.store, (s) => s.isDirty);
  useSettingsLeaveGuard(isDirty);

  return (
    <FormShell form={form} className="space-y-4">
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

      <form.Subscribe selector={(s) => s.values.password}>
        {(pw) => (
          <SubmitButton
            className="w-full"
            isPending={isPending}
            isSuccess={isSuccess}
            isError={isError}
            disabled={!isPasswordValid(pw)}
          >
            Update password
          </SubmitButton>
        )}
      </form.Subscribe>
    </FormShell>
  );
};

export default ChangePassword;
