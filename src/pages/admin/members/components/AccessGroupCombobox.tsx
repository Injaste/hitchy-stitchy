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

/** One-line summary of what a group grants, shown under its name while picking.
 *  Derived from the permissions themselves rather than the group's name, so it
 *  can't drift from the actual grant. */
const describeGroup = (group: AccessGroup | undefined): string | null => {
  if (!group) return null;
  const money = group.permissions.budget === "full";
  const team = group.permissions.members === "full";
  if (money && team) return "Full access — budget, gifts and the team";
  if (money) return "Full access — budget and gifts";
  if (team) return "Everything except budget and gifts";
  return "Everything except money and managing the team";
};

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
        <ComboboxEmpty>No access groups yet.</ComboboxEmpty>
        <ComboboxList>
          {(group: { value: string; items: string[] }) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxCollection>
                {(name: string) => {
                  const description = describeGroup(groupsByName[name]);
                  return (
                    <ComboboxItem key={name} value={name}>
                      <span className="flex flex-col gap-0.5">
                        <span>{name}</span>
                        {description && (
                          <span className="text-xs text-muted-foreground">
                            {description}
                          </span>
                        )}
                      </span>
                    </ComboboxItem>
                  );
                }}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default AccessGroupCombobox;
