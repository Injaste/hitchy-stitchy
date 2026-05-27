import { useMemo, useState, type FC } from "react";
import { Plus } from "lucide-react";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from "@/components/ui/combobox";

import { useRolesQuery } from "../../roles/queries";
import { CATEGORY_LABELS } from "../../roles/types";
import RoleCreateModal from "../../roles/modals/RoleCreateModal";
import type { Role } from "../../roles/types";

interface RoleComboboxProps {
  value: string;
  onChange: (roleId: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const CREATE_PREFIX = "__create__:";

const RoleCombobox: FC<RoleComboboxProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: roles = [] } = useRolesQuery();
  const assignable = roles.filter((r) => r.category !== "root");

  const rolesById = useMemo(
    () => Object.fromEntries(roles.map((r) => [r.id, r])),
    [roles],
  );

  // Names are the combobox item values — base-ui displays the value string
  // in the input, so we use names (not IDs) as item values, then map back
  // to ID on selection.
  const rolesByName = useMemo(
    () => Object.fromEntries(assignable.map((r) => [r.name, r])),
    [assignable],
  );

  const groups = useMemo(() => {
    const byCategory = assignable.reduce<Record<string, Role[]>>((acc, r) => {
      (acc[r.category] ??= []).push(r);
      return acc;
    }, {});

    return Object.entries(byCategory).map(([cat, items]) => ({
      value: cat,
      label: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat,
      names: items.map((r) => r.name),
    }));
  }, [assignable]);

  const trimmed = inputValue.trim();
  const exactMatch = assignable.some(
    (r) => r.name.toLowerCase() === trimmed.toLowerCase(),
  );
  const showCreate = trimmed.length > 0 && !exactMatch;

  const items = useMemo(() => {
    const base = groups.map((g) => ({ value: g.value, items: g.names }));
    if (!showCreate) return base;
    return [...base, { value: CREATE_PREFIX, items: [trimmed] }];
  }, [groups, showCreate, trimmed]);

  // Combobox value is the selected role's name (for display), derived from
  // the role_id stored in the form field.
  const displayValue = value ? (rolesById[value]?.name ?? null) : null;

  const openCreate = (name: string) => {
    setPendingName(name);
    setCreateOpen(true);
  };

  const closeCreate = () => {
    setCreateOpen(false);
    // Delay unmount so the modal can animate closed before disappearing.
    setTimeout(() => setPendingName(null), 300);
  };

  return (
    <>
      <Combobox
        value={displayValue}
        onValueChange={(v) => {
          if (!v) return onChange("");
          if (v.startsWith(CREATE_PREFIX)) {
            openCreate(v.slice(CREATE_PREFIX.length));
            return;
          }
          const role = rolesByName[v];
          if (role) {
            onChange(role.id);
            onBlur?.();
          }
        }}
        onInputValueChange={setInputValue}
        items={items}
        autoHighlight
      >
        <ComboboxInput
          placeholder={placeholder}
          showClear={!!value && !disabled}
          onBlur={onBlur}
          disabled={disabled}
        />

        <ComboboxContent>
          <ComboboxEmpty>No roles yet — type to create one.</ComboboxEmpty>

          <ComboboxList>
            {(group: { value: string; items: string[] }, index: number) => {
              const isCreate = group.value === CREATE_PREFIX;

              if (isCreate) {
                return (
                  <ComboboxGroup key={CREATE_PREFIX} items={group.items}>
                    {index > 0 && <ComboboxSeparator />}
                    <ComboboxCollection>
                      {(name: string) => (
                        <ComboboxItem
                          key={name}
                          value={`${CREATE_PREFIX}${name}`}
                          className="text-muted-foreground"
                        >
                          <Plus className="size-4 shrink-0" />
                          Add &ldquo;{trimmed}&rdquo; as new role
                        </ComboboxItem>
                      )}
                    </ComboboxCollection>
                  </ComboboxGroup>
                );
              }

              const groupMeta = groups.find((g) => g.value === group.value);

              return (
                <ComboboxGroup key={group.value} items={group.items}>
                  {groupMeta?.label && (
                    <ComboboxLabel>{groupMeta.label}</ComboboxLabel>
                  )}
                  <ComboboxCollection>
                    {(name: string) => (
                      <ComboboxItem key={name} value={name}>
                        {name}
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                  {index < items.length - 1 && <ComboboxSeparator />}
                </ComboboxGroup>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {pendingName !== null && (
        <RoleCreateModal
          open={createOpen}
          onOpenChange={(open) => {
            if (!open) closeCreate();
          }}
          defaultName={pendingName}
          onCreated={(role) => {
            onChange(role.id);
            onBlur?.();
            closeCreate();
          }}
        />
      )}
    </>
  );
};

export default RoleCombobox;
