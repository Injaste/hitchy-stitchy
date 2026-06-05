import { useMemo, useState, type ReactNode } from "react";
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
import FieldShell from "./fields/FieldShell";

export interface SelectComboGroup {
  /** Optional heading. When present, renders a ComboboxLabel above the items. */
  label?: string;
  items: string[];
}

interface SelectComboFieldProps {
  name: string;
  label?: ReactNode;
  optional?: boolean;
  description?: ReactNode;
  hint?: ReactNode;
  /** Grouped options. A group with a `label` renders a heading; without one it's flat. */
  groups: SelectComboGroup[];
  placeholder?: string;
  emptyText?: ReactNode;
  /** Source for the "already exists" check. Defaults to every group's items flattened. */
  matchAgainst?: string[];
  /** Renders the create-row content. Defaults to «Add "x" as new option». */
  createOption?: (input: string) => ReactNode;
}

const CREATE_PREFIX = "__create__:";

interface RenderGroup {
  value: string;
  heading?: string;
  items: string[];
}

const SelectComboField = ({
  name,
  label,
  optional,
  description,
  hint,
  groups,
  placeholder,
  emptyText = "No options yet — type to create one.",
  matchAgainst,
  createOption = (input) => <>Add &ldquo;{input}&rdquo; as new option</>,
}: SelectComboFieldProps) => {
  const [inputValue, setInputValue] = useState("");

  const trimmed = inputValue.trim();
  const matchSource = matchAgainst ?? groups.flatMap((g) => g.items);
  const exactMatch = matchSource.some(
    (l) => l.toLowerCase() === trimmed.toLowerCase(),
  );
  const showCreate = trimmed.length > 0 && !exactMatch;

  const items = useMemo<RenderGroup[]>(() => {
    const base: RenderGroup[] = groups
      .filter((g) => g.items.length > 0)
      .map((g, i) => ({
        value: g.label ?? `__group_${i}`,
        heading: g.label,
        items: g.items,
      }));
    if (!showCreate) return base;
    return [
      ...base,
      { value: CREATE_PREFIX, items: [`${CREATE_PREFIX}${trimmed}`] },
    ];
  }, [groups, showCreate, trimmed]);

  return (
    <FieldShell
      name={name}
      label={label}
      optional={optional}
      description={description}
      hint={hint}
    >
      {(field) => (
        <Combobox
          value={field.state.value || null}
          onValueChange={(v) => {
            if (!v) return field.handleChange("");
            field.handleChange(
              v.startsWith(CREATE_PREFIX) ? v.slice(CREATE_PREFIX.length) : v,
            );
            field.handleBlur();
          }}
          onInputValueChange={setInputValue}
          items={items}
          autoHighlight
        >
          <ComboboxInput
            placeholder={placeholder}
            showClear={!!field.state.value}
            onBlur={field.handleBlur}
          />

          <ComboboxContent>
            <ComboboxEmpty>{emptyText}</ComboboxEmpty>

            <ComboboxList>
              {(group: RenderGroup, index: number) => {
                const separator = index > 0 ? <ComboboxSeparator /> : null;

                if (group.value === CREATE_PREFIX) {
                  return (
                    <ComboboxGroup key={CREATE_PREFIX} items={group.items}>
                      {separator}
                      <ComboboxCollection>
                        {(item: string) => (
                          <ComboboxItem
                            key={item}
                            value={item}
                            className="text-muted-foreground"
                          >
                            <Plus className="size-4 shrink-0" />
                            {createOption(trimmed)}
                          </ComboboxItem>
                        )}
                      </ComboboxCollection>
                    </ComboboxGroup>
                  );
                }

                return (
                  <ComboboxGroup key={group.value} items={group.items}>
                    {separator}
                    {group.heading && (
                      <ComboboxLabel>{group.heading}</ComboboxLabel>
                    )}
                    <ComboboxCollection>
                      {(item: string) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxCollection>
                  </ComboboxGroup>
                );
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )}
    </FieldShell>
  );
};

export default SelectComboField;
