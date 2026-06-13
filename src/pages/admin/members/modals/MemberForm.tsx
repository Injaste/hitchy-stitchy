import { useForm, useStore } from "@tanstack/react-form";

import { FieldGroup } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  FieldShell,
  TextField,
  TextareaField,
  FormBody,
  SelectComboField,
} from "@/components/custom/form";

import { makeMemberSchema, type MemberValues } from "../types";
import AccessGroupCombobox from "../components/AccessGroupCombobox";
import { useMembersQuery } from "../queries";
import { useAccess } from "../../hooks/useAccess";
import { useFormShell } from "@/components/custom/form/form-context";

interface UseMemberFormOpts {
  defaultValues?: Partial<MemberValues>;
  /** Couple members' roles — blocked (alongside the literal Bride/Groom) for others. */
  reservedRoles?: string[];
  onSubmit: (values: MemberValues) => void;
}

/** Shared by create and edit — identical shape; the caller supplies defaults. */
export const useMemberForm = ({
  defaultValues,
  reservedRoles = [],
  onSubmit,
}: UseMemberFormOpts) => {
  const schema = makeMemberSchema(reservedRoles);
  return useForm({
    defaultValues: {
      display_name: defaultValues?.display_name ?? "",
      access_group_id: defaultValues?.access_group_id ?? "",
      role: defaultValues?.role ?? "",
      notes: defaultValues?.notes ?? "",
      couple_role: defaultValues?.couple_role ?? null,
    },
    validators: {
      onSubmit: schema,
      onChange: schema,
    },
    onSubmit: ({ value }) => {
      onSubmit(schema.parse(value));
    },
  });
};

interface MemberFormProps {
  /** Lock the access group selector (e.g. target is root, or caller doesn't outrank target). */
  lockAccessGroup?: boolean;
  /** Show the access group selector. Always true on create; gated by isSuperAdmin on edit. */
  showAccessGroup?: boolean;
  /** Pre-resolved access group name — shown immediately while the access groups query loads to avoid a flash. */
  accessGroupInitialName?: string;
  /** The member being edited — excluded from the couple-slot "taken" check (so editing the bride doesn't read as her own slot being taken). Omit on create. */
  currentMemberId?: string;
  /** Target member is root — access group is forced to show "SuperAdmin" and locked. */
  isRoot?: boolean;
}

const MemberForm = ({
  lockAccessGroup = false,
  showAccessGroup = true,
  accessGroupInitialName,
  currentMemberId,
  isRoot = false,
}: MemberFormProps) => {
  const { form } = useFormShell();
  const { canManageCouple } = useAccess();
  const { data: members = [] } = useMembersQuery();
  const roleOptions = Array.from(
    new Set(
      members
        // Bride/Groom are reserved couple identities (is_bride/is_groom) — don't
        // suggest them as hand-assignable roles for everyone else.
        .filter((m) => !m.is_bride && !m.is_groom)
        .map((m) => m.role)
        .filter((r): r is string => !!r && r.trim().length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  // Couple slots held by someone other than this member; hide the switches
  // without the couple permission or once both slots are taken elsewhere.
  const existingBride = members.find(
    (m) => m.is_bride && m.id !== currentMemberId,
  );
  const existingGroom = members.find(
    (m) => m.is_groom && m.id !== currentMemberId,
  );
  const showCoupleRole = canManageCouple && !(existingBride && existingGroom);
  const brideTakenBy = existingBride?.display_name ?? null;
  const groomTakenBy = existingGroom?.display_name ?? null;
  const coupleRole = useStore(
    form.store,
    (s: any) => s.values.couple_role,
  ) as "bride" | "groom" | null;
  const memberDisplayName = useStore(
    form.store,
    (s: any) => s.values.display_name,
  ) as string;
  const forceAccessSuperAdmin = isRoot || !!coupleRole;

  return (
    <FormBody>
      <FieldGroup>
        {/* ── Identity ──────────────────────────────────────────────── */}
        <TextField
          name="display_name"
          label="Display name"
          placeholder="e.g. Sarah Tan"
        />

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
                  disabled={lockAccessGroup || forceAccessSuperAdmin}
                  initialDisplayName={accessGroupInitialName}
                  overrideDisplayName={
                    forceAccessSuperAdmin ? "SuperAdmin" : undefined
                  }
                />
              )}
            </FieldShell>

            <SelectComboField
              name="role"
              label="Role"
              groups={[{ items: roleOptions }]}
              placeholder="e.g. Bridesmaid"
              emptyText="Type to add a role."
              createOption={(input) => input}
            />
          </div>
        ) : (
          <SelectComboField
            name="role"
            label="Role"
            groups={[{ items: roleOptions }]}
            placeholder="e.g. Bridesmaid"
            emptyText="Type to add a role."
            createOption={(input) => input}
          />
        )}

        {/* ── Couple role ────────────────────────────────────────────── */}
        {showCoupleRole && (
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
                    onCheckedChange={(v) => {
                      field.handleChange(v ? "bride" : null);
                      if (v && !form.getFieldValue("role")?.trim()) {
                        form.setFieldValue("role", "Bride");
                      }
                    }}
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
                    onCheckedChange={(v) => {
                      field.handleChange(v ? "groom" : null);
                      if (v && !form.getFieldValue("role")?.trim()) {
                        form.setFieldValue("role", "Groom");
                      }
                    }}
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
