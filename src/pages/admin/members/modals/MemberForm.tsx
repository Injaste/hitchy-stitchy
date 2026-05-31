import { useMemo } from "react";
import { useForm } from "@tanstack/react-form";

import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { DialogBody } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TextField, SelectField, type SelectFieldOption } from "@/components/custom/form";
import FieldShell from "@/components/custom/form/fields/FieldShell";

import {
  inviteMemberSchema,
  editMemberSchema,
  type InviteMemberValues,
  type EditMemberValues,
} from "../types";
import RoleCombobox from "../components/RoleCombobox";
import LabelCombobox from "../components/LabelCombobox";

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
      label: defaultValues?.label ?? "",
      notes: defaultValues?.notes ?? "",
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
      label: defaultValues?.label ?? "",
      notes: defaultValues?.notes ?? "",
      couple_role: defaultValues?.couple_role ?? ("" as "" | "bride" | "groom"),
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
  /** Lock the role selector (e.g. target is root, or caller doesn't outrank target). */
  lockRole?: boolean;
  /** When set in edit mode, renders a disabled email field. Omit to hide. */
  email?: string;
  /** Show the couple role selector (root or existing couple member only). */
  showCoupleRole?: boolean;
  /** Display name of another member who already holds the bride slot. */
  brideTakenBy?: string | null;
  /** Display name of another member who already holds the groom slot. */
  groomTakenBy?: string | null;
}

const MemberForm = ({
  mode,
  lockRole = false,
  email,
  showCoupleRole = false,
  brideTakenBy = null,
  groomTakenBy = null,
}: MemberFormProps) => {
  // Build couple options, hiding slots already held by another member.
  const coupleOptions = useMemo<SelectFieldOption[]>(() => {
    const opts: SelectFieldOption[] = [{ value: "", label: "None" }];
    if (!brideTakenBy) opts.push({ value: "bride", label: "Bride" });
    if (!groomTakenBy) opts.push({ value: "groom", label: "Groom" });
    return opts;
  }, [brideTakenBy, groomTakenBy]);

  const coupleDescription = useMemo(() => {
    const taken = [
      brideTakenBy && `Bride: ${brideTakenBy}`,
      groomTakenBy && `Groom: ${groomTakenBy}`,
    ].filter(Boolean);
    return taken.length
      ? `Slot${taken.length > 1 ? "s" : ""} already assigned — ${taken.join(" · ")}`
      : "Sets the system couple identity for this member.";
  }, [brideTakenBy, groomTakenBy]);

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
              placeholder="Select a role"
              disabled={lockRole}
            />
          )}
        </FieldShell>

        <FieldShell name="label" label="Label" optional>
          {(field) => (
            <LabelCombobox
              value={field.state.value ?? ""}
              onChange={(v) => field.handleChange(v)}
              onBlur={field.handleBlur}
              placeholder="e.g. Maid of Honor"
            />
          )}
        </FieldShell>

        {mode === "edit" && showCoupleRole && (
          <SelectField
            name="couple_role"
            label="Couple role"
            optional
            options={coupleOptions}
            description={coupleDescription}
          />
        )}

        <FieldShell name="notes" label="Notes" optional>
          {(field) => (
            <Textarea
              value={field.state.value ?? ""}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="What this person is responsible for…"
              rows={3}
            />
          )}
        </FieldShell>
      </FieldGroup>
    </DialogBody>
  );
};

export default MemberForm;
