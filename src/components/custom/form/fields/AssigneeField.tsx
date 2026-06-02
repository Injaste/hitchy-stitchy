import type { ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import ArraySeparator from "@/components/custom/array-separator";
import FieldShell from "./FieldShell";

export interface AssigneeItem {
  id: string;
  label: string;
}

export interface AssigneeGroup {
  name: string;
  memberIds: string[];
}

type GroupState = "all" | "some" | "none";

interface AssigneeFieldProps {
  name: string;
  label?: ReactNode;
  optional?: boolean;
  description?: ReactNode;
  items: AssigneeItem[];
  groups?: AssigneeGroup[];
}

const AssigneeField = ({
  name,
  label,
  optional,
  description,
  items,
  groups = [],
}: AssigneeFieldProps) => (
  <FieldShell name={name} label={label} optional={optional} description={description}>
    {(field) => {
      const value: string[] = field.state.value ?? [];

      const toggle = (id: string) => {
        field.handleChange(
          value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
        );
      };

      const groupState = (memberIds: string[]): GroupState => {
        const selected = memberIds.filter((id) => value.includes(id)).length;
        if (selected === 0) return "none";
        return selected === memberIds.length ? "all" : "some";
      };

      const toggleGroup = (memberIds: string[]) => {
        if (groupState(memberIds) === "all") {
          const remove = new Set(memberIds);
          field.handleChange(value.filter((v) => !remove.has(v)));
        } else {
          const next = new Set(value);
          memberIds.forEach((id) => next.add(id));
          field.handleChange([...next]);
        }
      };

      if (!items.length) {
        return (
          <p className="text-sm text-muted-foreground/60 italic">
            No members available
          </p>
        );
      }

      return (
        <div className="space-y-4">
          {groups.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground/70">Labels</p>
              <div className="grid grid-cols-2 gap-2">
                {groups.map((group) => {
                  const state = groupState(group.memberIds);
                  const selectedCount = group.memberIds.filter((id) => value.includes(id)).length;
                  const countLabel =
                    state === "some"
                      ? `${selectedCount}/${group.memberIds.length}`
                      : group.memberIds.length;
                  return (
                    <label
                      key={group.name}
                      className="flex cursor-pointer items-center justify-center rounded-lg border border-input px-2.5 py-2 text-sm text-muted-foreground transition-all active:scale-[0.95] has-[[data-state=unchecked]]:hover:bg-accent has-[[data-state=unchecked]]:hover:text-accent-foreground has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10 has-[[data-state=checked]]:text-foreground has-[[data-state=indeterminate]]:border-dashed has-[[data-state=indeterminate]]:border-primary/40 has-[[data-state=indeterminate]]:bg-primary/5"
                    >
                      <Checkbox
                        checked={
                          state === "all"
                            ? true
                            : state === "some"
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={() => toggleGroup(group.memberIds)}
                        className="sr-only"
                      />
                      <ArraySeparator
                        items={[group.name, countLabel]}
                        className="min-w-0"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {groups.length > 0 && (
              <p className="text-xs font-medium text-muted-foreground/70">Members</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {items.map((item) => {
                const checked = value.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center justify-center rounded-lg border border-input px-2.5 py-2 text-sm text-muted-foreground transition-all active:scale-[0.95] has-[[data-state=unchecked]]:hover:bg-accent has-[[data-state=unchecked]]:hover:text-accent-foreground has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10 has-[[data-state=checked]]:text-foreground"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(item.id)}
                      className="sr-only"
                    />
                    <span className="min-w-0 truncate">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      );
    }}
  </FieldShell>
);

export default AssigneeField;
