import { useForm } from "@tanstack/react-form";

import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { DialogBody } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TextField } from "@/components/custom/form";
import FieldShell from "@/components/custom/form/fields/FieldShell";

import {
  inviteMemberSchema,
  editMemberSchema,
  type InviteMemberValues,
  type EditMemberValues,
} from "../types";
import RoleCombobox from "../components/RoleCombobox";

interface UseMemberInviteFormOpts {
  defaultValues?: Partial<InviteMemberValues>;
  onSubmit: (values: InviteMemberValues) => void;
}

export const useMemberInviteForm = ({
  defaultValues,
  onSubmit,
}: UseMemberInviteFormOpts) =>
  useForm({
    defaultValues: {
      display_name: defaultValues?.display_name ?? "",
      email: defaultValues?.email ?? "",
      role_id: defaultValues?.role_id ?? "",
    },
    validators: {
      onSubmit: inviteMemberSchema,
      onChange: inviteMemberSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(inviteMemberSchema.parse(value));
    },
  });

interface UseMemberEditFormOpts {
  defaultValues?: Partial<EditMemberValues>;
  onSubmit: (values: EditMemberValues) => void;
}

export const useMemberEditForm = ({
  defaultValues,
  onSubmit,
}: UseMemberEditFormOpts) =>
  useForm({
    defaultValues: {
      display_name: defaultValues?.display_name ?? "",
      role_id: defaultValues?.role_id ?? "",
    },
    validators: {
      onSubmit: editMemberSchema,
      onChange: editMemberSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(editMemberSchema.parse(value));
    },
  });

interface MemberFormProps {
  mode: "invite" | "edit";
  /** Lock the role selector — used when editing the root member. */
  lockRole?: boolean;
  /** When set in edit mode, renders a disabled email field. Omit to hide. */
  email?: string;
}

const MemberForm = ({ mode, lockRole = false, email }: MemberFormProps) => {
  return (
    <DialogBody>
      <FieldGroup>
        <TextField
          name="display_name"
          label="Display name"
          placeholder="e.g. Sarah Tan"
        />

        {mode === "invite" && (
          <TextField
            name="email"
            label="Email"
            type="email"
            placeholder="sarah@example.com"
            description="Email cannot be changed once assigned."
          />
        )}

        {mode === "edit" && email && (
          <Field className="gap-2">
            <FieldLabel>Email</FieldLabel>
            <FieldContent>
              <Input type="email" value={email} disabled readOnly />
            </FieldContent>
          </Field>
        )}

        <FieldShell name="role_id" label="Role">
          {(field) => (
            <RoleCombobox
              value={field.state.value ?? ""}
              onChange={(roleId) => field.handleChange(roleId)}
              onBlur={field.handleBlur}
              placeholder="Select or create a role"
              disabled={lockRole}
            />
          )}
        </FieldShell>
      </FieldGroup>
    </DialogBody>
  );
};

export default MemberForm;
