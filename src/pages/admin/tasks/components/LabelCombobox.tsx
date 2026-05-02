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
} from "@/components/ui/combobox";

interface LabelComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  labels: string[];
  placeholder?: string;
}

const CREATE_PREFIX = "__create__:";

const LabelCombobox: FC<LabelComboboxProps> = ({
  value,
  onChange,
  onBlur,
  labels,
  placeholder,
}) => {
  const [inputValue, setInputValue] = useState("");

  const trimmed = inputValue.trim();
  const exactMatch = labels.some(
    (l) => l.toLowerCase() === trimmed.toLowerCase(),
  );
  const showCreate = trimmed.length > 0 && !exactMatch;

  const items = useMemo(() => {
    const groups: { value: string; items: string[] }[] = [];
    if (labels.length > 0) {
      groups.push({ value: "labels", items: labels });
    }
    if (showCreate) {
      groups.push({
        value: CREATE_PREFIX,
        items: [`${CREATE_PREFIX}${trimmed}`],
      });
    }
    return groups;
  }, [labels, showCreate, trimmed]);

  return (
    <Combobox
      value={value || null}
      onValueChange={(v) => {
        if (!v) return onChange("");
        onChange(
          v.startsWith(CREATE_PREFIX) ? v.slice(CREATE_PREFIX.length) : v,
        );
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
        <ComboboxEmpty>No labels yet — type to create one.</ComboboxEmpty>

        <ComboboxList>
          {(group) => {
            const isCreate = group.value === CREATE_PREFIX;

            if (isCreate) {
              return (
                <ComboboxGroup key={CREATE_PREFIX} items={group.items}>
                  <ComboboxCollection>
                    {(item) => (
                      <ComboboxItem
                        key={item}
                        value={item}
                        className="text-muted-foreground"
                      >
                        <Plus className="size-4 shrink-0" />
                        Add &ldquo;{trimmed}&rdquo; as new label
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
              );
            }

            return (
              <ComboboxGroup key={group.value} items={group.items}>
                <ComboboxCollection>
                  {(item) => (
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
