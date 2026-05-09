import type { FC } from "react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { DialogBody, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  FormShell,
  TextField,
  SelectField,
  type SelectFieldOption,
} from "@/components/custom/fields";

import { useRolesQuery } from "../../roles/queries";
import {
  inviteMemberSchema,
  editMemberSchema,
  type InviteMemberValues,
  type EditMemberValues,
} from "../types";

interface MemberFormPropsInvite {
  mode: "invite";
  defaultValues?: Partial<InviteMemberValues>;
  onSubmit: (values: InviteMemberValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

interface MemberFormPropsEdit {
  mode: "edit";
  defaultValues?: Partial<EditMemberValues>;
  onSubmit: (values: EditMemberValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

type MemberFormProps = MemberFormPropsInvite | MemberFormPropsEdit;

const MemberForm: FC<MemberFormProps> = ({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}) => {
  const { data: roles } = useRolesQuery();

  const schema = mode === "invite" ? inviteMemberSchema : editMemberSchema;

  const allRoles = roles ?? [];
  const isRootMember =
    mode === "edit" &&
    allRoles.find((r) => r.id === defaultValues?.role_id)?.category === "root";

  const roleOptions: SelectFieldOption[] = (() => {
    if (mode === "edit" && allRoles.length)
      return allRoles.map((r) => ({
        value: r.id,
        label: r.name,
        disabled: r.category === "root",
      }));

    const assignable = allRoles.filter((r) => r.category !== "root");
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

  const form = useForm({
    defaultValues: {
      display_name: defaultValues?.display_name ?? "",
      ...(mode === "invite" && {
        email: (defaultValues as Partial<InviteMemberValues>)?.email ?? "",
      }),
      role_id: defaultValues?.role_id ?? "",
    },
    validators: {
      onSubmit: schema,
      onChange: schema,
    },
    onSubmit: ({ value }) => {
      onSubmit(schema.parse(value) as any);
    },
  });

  return (
    <FormShell form={form} className="grid gap-4">
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
            disabled={isRootMember}
          />
        </FieldGroup>
      </DialogBody>

      <Separator />

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </DialogFooter>
    </FormShell>
  );
};

export default MemberForm;
