import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

import { FieldGroup } from "@/components/ui/field";
import {
  FormCard,
  FormHeader,
  FormBody,
  FormFooter,
  FormError,
  PasswordField,
} from "@/components/custom/form";

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
      <FormHeader icon={<KeyRound className="size-4" />} title="Change Password" />

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
          <FormError error={mutationError} />
        </FieldGroup>
      </FormBody>

      <FormFooter submitLabel="Update password" />
    </FormCard>
  );
};

export default ChangePassword;
