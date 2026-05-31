import { Fragment, type FC } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Role } from "../../roles/types";
import {
  type AccessLevel,
  type Resource,
  RESOURCE_GROUPS,
  RESOURCE_LABELS,
  deriveAccessLevel,
  getResourcePermission,
} from "../types";
import { ACCESS_CONFIG, LEVEL_ORDER } from "./access-config";

interface EditableCellProps {
  level: AccessLevel;
  resource: Resource;
  role: Role;
  onToggle: (role: Role, resource: Resource, next: AccessLevel) => void;
  disabled?: boolean;
}

const EditableCell: FC<EditableCellProps> = ({ level, resource, role, onToggle, disabled }) => {
  const { icon: Icon, className } = ACCESS_CONFIG[level];

  if (disabled) {
    return (
      <span className={cn("inline-flex w-full justify-center items-center py-3.5", className)}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex w-full justify-center items-center py-3.5 hover:bg-muted/60 transition-colors",
            className,
          )}
        >
          <Icon className="w-3.5 h-3.5 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[120px]">
        {LEVEL_ORDER.map((lvl) => {
          const { icon: LvlIcon, label: lvlLabel, className: lvlClass } = ACCESS_CONFIG[lvl];
          return (
            <DropdownMenuItem
              key={lvl}
              onSelect={() => onToggle(role, resource, lvl)}
              className={cn("gap-2 text-xs", lvl === level && "bg-accent")}
            >
              <LvlIcon className={cn("w-3.5 h-3.5 shrink-0", lvlClass)} />
              {lvl === "none" ? "No access" : lvlLabel}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface PermissionsTableBodyProps {
  roles: Role[];
  colCount: number;
  canCreate: boolean;
  canUpdate: boolean;
  onToggle: (role: Role, resource: Resource, next: AccessLevel) => void;
}

const PermissionsTableBody: FC<PermissionsTableBodyProps> = ({
  roles,
  colCount,
  canCreate,
  canUpdate,
  onToggle,
}) => (
  <tbody>
    {RESOURCE_GROUPS.map((group, gi) => (
      <Fragment key={`group-${gi}`}>
        <tr className="border-t border-border/40 bg-muted/20">
          <td
            colSpan={colCount}
            className="px-5 py-2 text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/50"
          >
            {group.label}
          </td>
        </tr>
        {group.resources.map((resource, ri) => (
          <tr
            key={resource}
            className={cn(
              "border-t border-border/30 transition-colors hover:bg-muted/20",
              ri === group.resources.length - 1 && "border-b border-border/30",
            )}
          >
            <td className="px-5 py-3.5 font-medium text-foreground/90">
              {RESOURCE_LABELS[resource]}
            </td>

            {roles.map((role) => {
              const perm = getResourcePermission(role.permissions, resource);
              const level = deriveAccessLevel(perm, resource);
              return (
                <td key={role.id}>
                  <EditableCell
                    level={level}
                    resource={resource}
                    role={role}
                    onToggle={onToggle}
                    disabled={!canUpdate}
                  />
                </td>
              );
            })}

            {canCreate && <td />}
          </tr>
        ))}
      </Fragment>
    ))}
  </tbody>
);

export default PermissionsTableBody;
