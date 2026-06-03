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

import { useAccessGroupsQuery } from "../../access/queries";
import type { AccessGroup } from "../../access/types";

interface AccessGroupComboboxProps {
  value: string;
  onChange: (accessGroupId: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  /** Display name shown immediately while the access groups query is still loading. */
  initialDisplayName?: string;
  /** When set, always overrides the displayed name regardless of loaded data. */
  overrideDisplayName?: string;
}

const AccessGroupCombobox: FC<AccessGroupComboboxProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  initialDisplayName,
  overrideDisplayName,
}) => {
  const { data: accessGroups = [] } = useAccessGroupsQuery();

  const groupsById = useMemo(
    () => Object.fromEntries(accessGroups.map((g) => [g.id, g])),
    [accessGroups],
  );

  const groupsByName = useMemo(
    () => Object.fromEntries(accessGroups.map((g) => [g.name, g])),
    [accessGroups],
  );

  const items = useMemo(
    () => [{ value: "access-groups", items: accessGroups.map((g) => g.name) }],
    [accessGroups],
  );

  const displayValue = overrideDisplayName ?? (value ? (groupsById[value]?.name ?? initialDisplayName ?? null) : null);

  return (
    <Combobox
      value={displayValue}
      onValueChange={(v) => {
        if (!v) return onChange("");
        const group = groupsByName[v] as AccessGroup | undefined;
        if (group) {
          onChange(group.id);
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
        <ComboboxEmpty>No access groups yet — add them in Access.</ComboboxEmpty>
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

export default AccessGroupCombobox;
