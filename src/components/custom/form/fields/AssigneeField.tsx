import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
                  return (
                    <Button
                      key={group.name}
                      type="button"
                      variant="outline"
                      size="lg"
                      role="checkbox"
                      aria-checked={
                        state === "all" ? true : state === "some" ? "mixed" : false
                      }
                      onClick={() => toggleGroup(group.memberIds)}
                      className={cn(
                        "text-muted-foreground hover:border-border",
                        state === "all" &&
                          "border-foreground/40! bg-foreground/10! text-foreground",
                        state === "some" &&
                          "border-foreground/40! border-dashed! text-foreground",
                      )}
                    >
                      <span className="min-w-0 truncate">{group.name}</span>
                      <span className="text-muted-foreground/70">
                        · {group.memberIds.length}
                      </span>
                    </Button>
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
                  <Button
                    key={item.id}
                    type="button"
                    variant="outline"
                    size="lg"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggle(item.id)}
                    className={cn(
                      "text-muted-foreground hover:border-border",
                      checked &&
                        "border-foreground/40! bg-foreground/10! text-foreground",
                    )}
                  >
                    <span className="min-w-0 truncate">{item.label}</span>
                  </Button>
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
