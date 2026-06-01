import { useMemo, type FC } from "react";

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

import { useRolesQuery } from "../../roles/queries";
import type { Role } from "../../roles/types";

interface RoleComboboxProps {
  value: string;
  onChange: (roleId: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  /** Display name shown immediately while the roles query is still loading. */
  initialDisplayName?: string;
}

const RoleCombobox: FC<RoleComboboxProps> = ({
  value,
  onChange,
  onBlur,
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

  const displayValue = value ? (rolesById[value]?.name ?? initialDisplayName ?? null) : null;

  return (
    <Combobox
      value={displayValue}
      onValueChange={(v) => {
        if (!v) return onChange("");
        const role = rolesByName[v] as Role | undefined;
        if (role) {
          onChange(role.id);
          onBlur?.();
        }
      }}
      items={items}
      autoHighlight
    >
      <ComboboxInput
        placeholder={placeholder}
        showClear={false}
        onBlur={onBlur}
        disabled={disabled}
      />
      <ComboboxContent>
        <ComboboxEmpty>No roles yet — add them in Roles &amp; Permissions.</ComboboxEmpty>
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
};

export default RoleCombobox;
