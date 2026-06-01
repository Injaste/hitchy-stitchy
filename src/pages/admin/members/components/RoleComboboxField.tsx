import { useMemo, type FC, type ReactNode } from "react";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import FieldShell from "@/components/custom/form/fields/FieldShell";

import { useRolesQuery } from "../../roles/queries";
import type { Role } from "../../roles/types";

interface RoleComboboxFieldProps {
  name: string;
  label?: ReactNode;
  optional?: boolean;
  placeholder?: string;
  disabled?: boolean;
  /** Display name shown immediately while the roles query is still loading. */
  initialDisplayName?: string;
}

const RoleComboboxField: FC<RoleComboboxFieldProps> = ({
  name,
  label,
  optional,
  placeholder,
  disabled = false,
  initialDisplayName,
}) => {
  const { data: roles = [] } = useRolesQuery();

  const rolesById = useMemo(
    () => Object.fromEntries(roles.map((r) => [r.id, r])),
    [roles],
  );

  const rolesByName = useMemo(
    () => Object.fromEntries(roles.map((r) => [r.name, r])),
    [roles],
  );

  const items = useMemo(
    () => [{ value: "roles", items: roles.map((r) => r.name) }],
    [roles],
  );

  return (
    <FieldShell name={name} label={label} optional={optional}>
      {(field) => {
        // Stored value is a role ID; display the resolved name (or the
        // initialDisplayName fallback while the query is loading).
        const displayValue = field.state.value
          ? (rolesById[field.state.value]?.name ?? initialDisplayName ?? null)
          : null;

        return (
          <Combobox
            value={displayValue}
            onValueChange={(v) => {
              if (!v) return field.handleChange("");
              const role = rolesByName[v] as Role | undefined;
              if (role) {
                field.handleChange(role.id);
                field.handleBlur();
              }
            }}
            items={items}
            autoHighlight
          >
            <ComboboxInput
              placeholder={placeholder}
              showClear={false}
              onBlur={field.handleBlur}
              disabled={disabled}
            />
            <ComboboxContent>
              <ComboboxEmpty>
                No roles yet — add them in Roles &amp; Permissions.
              </ComboboxEmpty>
              <ComboboxList>
                {(group: { value: string; items: string[] }) => (
                  <ComboboxGroup key={group.value} items={group.items}>
                    <ComboboxCollection>
                      {(name: string) => (
                        <ComboboxItem key={name} value={name}>
                          {name}
                        </ComboboxItem>
                      )}
                    </ComboboxCollection>
                  </ComboboxGroup>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        );
      }}
    </FieldShell>
  );
};

export default RoleComboboxField;
