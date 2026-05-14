import { useForm } from "@tanstack/react-form";

import { FieldGroup } from "@/components/ui/field";
import { DialogBody } from "@/components/ui/dialog";
import {
  TextField,
  SelectField,
  type SelectFieldOption,
} from "@/components/custom/form";

import { useRolesQuery } from "../../roles/queries";
import {
  inviteMemberSchema,
  editMemberSchema,
  type InviteMemberValues,
  type EditMemberValues,
} from "../types";

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
}

const MemberForm = ({ mode, lockRole = false }: MemberFormProps) => {
  const { data: roles = [] } = useRolesQuery();

  const roleOptions: SelectFieldOption[] = (() => {
    if (mode === "edit" && roles.length)
      return roles.map((r) => ({
        value: r.id,
        label: r.name,
        disabled: r.category === "root",
      }));

    const assignable = roles.filter((r) => r.category !== "root");
    if (assignable.length)
      return assignable.map((r) => ({ value: r.id, label: r.name }));

    return [
      {
        value: "0",
        label: "No roles available — add roles first",
        disabled: true,
      },
    ];
  })();

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

        <SelectField
          name="role_id"
          label="Role"
          options={roleOptions}
          placeholder="Select a role"
          disabled={lockRole}
        />
      </FieldGroup>
    </DialogBody>
  );
};

export default MemberForm;
