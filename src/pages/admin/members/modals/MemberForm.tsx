import { useMemo } from "react";
import { Info } from "lucide-react";
import { useForm } from "@tanstack/react-form";

import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { DialogBody } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  FieldShell,
  TextField,
  TextareaField,
  LabelComboboxField,
} from "@/components/custom/form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  inviteMemberSchema,
  editMemberSchema,
  type InviteMemberValues,
  type EditMemberValues,
} from "../types";
import RoleComboboxField from "../components/RoleComboboxField";
import { useMembersQuery } from "../queries";
import { cn } from "@/lib/utils";

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
      couple_role: defaultValues?.couple_role ?? null,
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
  /** Show the role selector. Always true in invite mode; gated by isSuperAdmin in edit mode. */
  showRole?: boolean;
  /** When set in edit mode, renders a disabled email field. Omit to hide. */
  email?: string;
  /** Pre-resolved role name — shown immediately while the roles query loads to avoid a flash. */
  roleInitialName?: string;
  /** Show the couple role switches (super admin only). */
  showCoupleRole?: boolean;
  /** Display name of another member who already holds the bride slot. */
  brideTakenBy?: string | null;
  /** Display name of another member who already holds the groom slot. */
  groomTakenBy?: string | null;
}

const MemberForm = ({
  mode,
  lockRole = false,
  showRole = true,
  email,
  roleInitialName,
  showCoupleRole = false,
  brideTakenBy = null,
  groomTakenBy = null,
}: MemberFormProps) => {
  const showEmailField = mode === "invite" || !!email;

  const { data: members = [] } = useMembersQuery();
  const existingLabels = useMemo(() => {
    const set = new Set<string>();
    for (const m of members) if (m.label) set.add(m.label);
    return Array.from(set).sort();
  }, [members]);

  return (
    <DialogBody>
      <FieldGroup>
        {/* ── Identity + access ─────────────────────────────────────── */}
        {showEmailField ? (
          /* display_name | email — 2-col */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              name="display_name"
              label="Display name"
              placeholder="e.g. Sarah Tan"
            />

            {mode === "invite" && (
              <TextField
                name="email"
                label={
                  <span className="flex items-center gap-1">
                    Email
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          tabIndex={0}
                          className="inline-flex text-muted-foreground cursor-default"
                        >
                          <Info className="size-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        Can't be changed after the invite is sent.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                }
                type="email"
                placeholder="sarah@example.com"
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
          </div>
        ) : (
          <TextField
            name="display_name"
            label="Display name"
            placeholder="e.g. Sarah Tan"
          />
        )}

        <div
          className={cn(
            "grid gap-4",
            showRole ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
          )}
        >
          {showRole && (
            // RoleComboboxField can't use LabelComboboxField: the form stores a
            // role ID but displays a name, so it needs its own ID↔name mapping
            // and an initialDisplayName fallback while the roles query loads.
            <RoleComboboxField
              name="role_id"
              label="Role"
              placeholder="Select a role"
              disabled={lockRole}
              initialDisplayName={roleInitialName}
            />
          )}
          <LabelComboboxField
            name="label"
            label="Label"
            optional
            groups={[{ items: existingLabels }]}
            placeholder="e.g. Maid of Honor"
            emptyText="Type to add a label."
            createLabel={(input) => input}
          />
        </div>

        {/* ── Couple role ────────────────────────────────────────────── */}
        {mode === "edit" && showCoupleRole && (
          <FieldShell name="couple_role" label="Couple role" optional>
            {(field) => (
              <div className="space-y-2">
                {/* Bride */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">
                    Bride
                    {brideTakenBy && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        · {brideTakenBy}
                      </span>
                    )}
                  </span>
                  <Switch
                    size="sm"
                    checked={field.state.value === "bride"}
                    onCheckedChange={(v) =>
                      field.handleChange(v ? "bride" : null)
                    }
                    disabled={!!brideTakenBy}
                  />
                </div>

                {/* Groom */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">
                    Groom
                    {groomTakenBy && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        · {groomTakenBy}
                      </span>
                    )}
                  </span>
                  <Switch
                    size="sm"
                    checked={field.state.value === "groom"}
                    onCheckedChange={(v) =>
                      field.handleChange(v ? "groom" : null)
                    }
                    disabled={!!groomTakenBy}
                  />
                </div>
              </div>
            )}
          </FieldShell>
        )}

        {/* ── Notes ─────────────────────────────────────────────────── */}
        <TextareaField
          name="notes"
          label="Notes"
          optional
          rows={3}
          placeholder="What this person is responsible for…"
        />
      </FieldGroup>
    </DialogBody>
  );
};

export default MemberForm;
