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
  ComboboxList,
  ComboboxSeparator,
} from "@/components/ui/combobox";

import { useMembersQuery } from "../queries";

interface LabelComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}

const CREATE_PREFIX = "__create__:";

const LabelCombobox: FC<LabelComboboxProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
}) => {
  const [inputValue, setInputValue] = useState("");
  const { data: members = [] } = useMembersQuery();

  // Collect distinct labels already used across members.
  const existingLabels = useMemo(() => {
    const set = new Set<string>();
    for (const m of members) {
      if (m.label) set.add(m.label);
    }
    return Array.from(set).sort();
  }, [members]);

  const trimmed = inputValue.trim();
  const exactMatch = existingLabels.some(
    (l) => l.toLowerCase() === trimmed.toLowerCase(),
  );
  const showCreate = trimmed.length > 0 && !exactMatch;

  const items = useMemo(() => {
    const base = existingLabels.length
      ? [{ value: "existing", items: existingLabels }]
      : [];
    if (!showCreate) return base;
    return [...base, { value: CREATE_PREFIX, items: [`${CREATE_PREFIX}${trimmed}`] }];
  }, [existingLabels, showCreate, trimmed]);

  return (
    <Combobox
      value={value || null}
      onValueChange={(v) => {
        if (!v) return onChange("");
        onChange(v.startsWith(CREATE_PREFIX) ? v.slice(CREATE_PREFIX.length) : v);
        onBlur?.();
      }}
      onInputValueChange={setInputValue}
      items={items}
      autoHighlight
    >
      <ComboboxInput
        placeholder={placeholder}
        showClear={!!value}
        onBlur={onBlur}
      />
      <ComboboxContent>
        <ComboboxEmpty>Type to add a label.</ComboboxEmpty>
        <ComboboxList>
          {(group: { value: string; items: string[] }, index: number) => {
            const isCreate = group.value === CREATE_PREFIX;
            if (isCreate) {
              return (
                <ComboboxGroup key={CREATE_PREFIX} items={group.items}>
                  {index > 0 && <ComboboxSeparator />}
                  <ComboboxCollection>
                    {(item: string) => (
                      <ComboboxItem
                        key={item}
                        value={item}
                        className="text-muted-foreground"
                      >
                        <Plus className="size-4 shrink-0" />
                        {trimmed}
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
              );
            }
            return (
              <ComboboxGroup key={group.value} items={group.items}>
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
  );
};

export default LabelCombobox;
