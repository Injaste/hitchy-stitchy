import { Info } from "lucide-react";
import { useForm, useStore } from "@tanstack/react-form";

import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  FieldShell,
  TextField,
  TextareaField,
  FormBody,
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
import AccessGroupCombobox from "../components/AccessGroupCombobox";
import RoleCombobox from "../components/RoleCombobox";
import { useFormShell } from "@/components/custom/form/form-context";

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
      access_group_id: defaultValues?.access_group_id ?? "",
      role: defaultValues?.role ?? "",
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
      access_group_id: defaultValues?.access_group_id ?? "",
      role: defaultValues?.role ?? "",
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
  /** Lock the access group selector (e.g. target is root, or caller doesn't outrank target). */
  lockAccessGroup?: boolean;
  /** Show the access group selector. Always true in invite mode; gated by isSuperAdmin in edit mode. */
  showAccessGroup?: boolean;
  /** When set in edit mode, renders a disabled email field. Omit to hide. */
  email?: string;
  /** Pre-resolved access group name — shown immediately while the access groups query loads to avoid a flash. */
  accessGroupInitialName?: string;
  /** Show the couple role switches (super admin only). */
  showCoupleRole?: boolean;
  /** Display name of another member who already holds the bride slot. */
  brideTakenBy?: string | null;
  /** Display name of another member who already holds the groom slot. */
  groomTakenBy?: string | null;
  /** Target member is root — access group is forced to show "Superadmin" and locked. */
  isRoot?: boolean;
}

const MemberForm = ({
  mode,
  lockAccessGroup = false,
  showAccessGroup = true,
  email,
  accessGroupInitialName,
  showCoupleRole = false,
  brideTakenBy = null,
  groomTakenBy = null,
  isRoot = false,
}: MemberFormProps) => {
  const showEmailField = mode === "invite" || !!email;
  const { form } = useFormShell();
  const coupleRole =
    mode === "edit"
      ? (useStore(form.store, (s: any) => s.values.couple_role) as
          | "bride"
          | "groom"
          | null)
      : null;
  const forcedRole =
    coupleRole === "bride" ? "Bride" : coupleRole === "groom" ? "Groom" : null;
  const memberDisplayName =
    mode === "edit"
      ? (useStore(form.store, (s: any) => s.values.display_name) as string)
      : null;
  const forceAccessSuperadmin = isRoot || !!coupleRole;

  return (
    <FormBody>
      <FieldGroup>
        {/* ── Identity ──────────────────────────────────────────────── */}
        {showEmailField ? (
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

        {/* ── Access + Role ──────────────────────────────────────────── */}
        {showAccessGroup ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldShell name="access_group_id" label="Access">
              {(field) => (
                <AccessGroupCombobox
                  value={field.state.value ?? ""}
                  onChange={(accessGroupId) =>
                    field.handleChange(accessGroupId)
                  }
                  onBlur={field.handleBlur}
                  placeholder="Select an access group"
                  disabled={lockAccessGroup || forceAccessSuperadmin}
                  initialDisplayName={accessGroupInitialName}
                  overrideDisplayName={forceAccessSuperadmin ? "Superadmin" : undefined}
                />
              )}
            </FieldShell>

            <FieldShell name="role" label="Role" optional>
              {(field) => (
                <RoleCombobox
                  value={forcedRole ?? field.state.value ?? ""}
                  onChange={(v) => field.handleChange(v)}
                  onBlur={field.handleBlur}
                  placeholder={forcedRole ? "" : "e.g. Bridesmaid"}
                  disabled={!!forcedRole}
                />
              )}
            </FieldShell>
          </div>
        ) : (
          <FieldShell name="role" label="Role" optional>
            {(field) => (
              <RoleCombobox
                value={field.state.value ?? ""}
                onChange={(v) => field.handleChange(v)}
                onBlur={field.handleBlur}
                placeholder="e.g. Bridesmaid"
              />
            )}
          </FieldShell>
        )}

        {/* ── Couple role ────────────────────────────────────────────── */}
        {mode === "edit" && showCoupleRole && (
          <FieldShell name="couple_role" label="Couple role" optional>
            {(field) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">
                    Bride
                    {(brideTakenBy || field.state.value === "bride") && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        · {brideTakenBy ?? memberDisplayName}
                      </span>
                    )}
                  </span>
                  <Switch
                    checked={field.state.value === "bride"}
                    onCheckedChange={(v) =>
                      field.handleChange(v ? "bride" : null)
                    }
                    disabled={!!brideTakenBy}
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">
                    Groom
                    {(groomTakenBy || field.state.value === "groom") && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        · {groomTakenBy ?? memberDisplayName}
                      </span>
                    )}
                  </span>
                  <Switch
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
    </FormBody>
  );
};

export default MemberForm;
