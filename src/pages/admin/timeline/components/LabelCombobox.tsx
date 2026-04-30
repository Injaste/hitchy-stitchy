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
import { Button } from "@/components/ui/button";

import type { TimelineGroupedDay, TimelineLabelGroup } from "../types";

interface LabelComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  days: TimelineGroupedDay[];
  labels: string[];
  placeholder?: string;
}

const CREATE_PREFIX = "__create__:";

const LabelCombobox: FC<LabelComboboxProps> = ({
  value,
  onChange,
  onBlur,
  days,
  labels,
  placeholder,
}) => {
  const [inputValue, setInputValue] = useState("");

  const groups = useMemo(
    () =>
      days
        .map((day, idx) => {
          const dayLabels = day.labelGroups
            .filter(
              (g): g is TimelineLabelGroup & { label: string } =>
                g.label !== null,
            )
            .map((g) => g.label);
          return { value: `Day ${idx + 1}`, items: dayLabels };
        })
        .filter((g) => g.items.length > 0),
    [days],
  );

  const trimmed = inputValue.trim();
  const exactMatch = labels.some(
    (l) => l.toLowerCase() === trimmed.toLowerCase(),
  );
  const showCreate = trimmed.length > 0 && !exactMatch;

  const items = useMemo(() => {
    if (!showCreate) return groups;
    return [
      ...groups,
      { value: CREATE_PREFIX, items: [`${CREATE_PREFIX}${trimmed}`] },
    ];
  }, [groups, showCreate, trimmed]);

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
          {(group, index) => {
            const isCreate = group.value === CREATE_PREFIX;

            if (isCreate) {
              return (
                <ComboboxGroup key={CREATE_PREFIX} items={group.items}>
                  {index > 0 && <ComboboxSeparator />}
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
                <ComboboxLabel>{group.value}</ComboboxLabel>
                <ComboboxCollection>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
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
  );
};

export default LabelCombobox;
