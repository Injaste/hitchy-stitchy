import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  const lower = trimmed.toLowerCase();

  return (
    <FieldShell
      name={name}
      label={label}
      optional={optional}
      description={description}
      hint={hint}
    >
      {(field) => {
        const current = (field.state.value ?? "").trim();
        const flat = groups.flatMap((g) => g.items);

        // Surface the committed value as a real, selectable row so it shows a
        // checkmark on reopen and stops being re-offered as "create". Skip when
        // it's empty or already one of the listed (persisted) options.
        const currentListed =
          !current || flat.some((o) => o.toLowerCase() === current.toLowerCase());
        const renderGroups: RenderGroup[] = [
          ...(currentListed ? [] : [{ value: "__current__", items: [current] }]),
          ...groups
            .filter((g) => g.items.length > 0)
            .map((g, i) => ({
              value: g.label ?? `__group_${i}`,
              heading: g.label,
              items: g.items,
            })),
        ];
        const listed = renderGroups.flatMap((g) => g.items);

        // "Already exists" spans the dedupe source (matchAgainst) plus the current
        // value, so typing either one suppresses the create-row.
        const matchSource = matchAgainst ?? flat;
        const exactMatch = [...(current ? [current] : []), ...matchSource].find(
          (l) => l.toLowerCase() === lower,
        );
        const showCreate = trimmed.length > 0 && !exactMatch;

        // Hint shown while source options match (collapses once only the
        // create-row remains). Measured against `flat`, not `listed`, so
        // committing a value — which adds it to `listed` — can't flip the hint
        // on and replay its entrance animation as the popup is closing.
        const hasMatches = flat.some((o) => o.toLowerCase().includes(lower));

        // Blur/Tab mirror Enter: autoHighlight selects the first matching rendered
        // item (create-row is appended last, so real matches win); with nothing
        // typed there's no highlight, so the value is left untouched.
        const enterSelection = (): string | null => {
          if (!trimmed) return null;
          const match = listed.find((o) => o.toLowerCase().includes(lower));
          if (match) return match;
          return showCreate ? trimmed : null;
        };

        const items: RenderGroup[] = showCreate
          ? [
              ...renderGroups,
              { value: CREATE_PREFIX, items: [`${CREATE_PREFIX}${trimmed}`] },
            ]
          : renderGroups;

        return (
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
              onBlur={() => {
                // Commit on blur/tab the same way Enter would select the highlight.
                const sel = enterSelection();
                if (sel !== null) field.handleChange(sel);
                field.handleBlur();
              }}
            />

            <ComboboxContent>
              <ComboboxEmpty>{emptyText}</ComboboxEmpty>

              <AnimatePresence initial={false}>
                {hasMatches && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="flex items-center gap-1.5 px-2 pt-2 pb-1 text-xs text-muted-foreground">
                      <Plus className="size-3.5 shrink-0" />
                      Type to create a new item
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
        );
      }}
    </FieldShell>
  );
};

export default SelectComboField;
