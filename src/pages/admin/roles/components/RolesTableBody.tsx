import { Fragment, useEffect, useMemo, type FC } from "react";
import { useForm } from "@tanstack/react-form";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { Role } from "../types";
import {
  type AccessLevel,
  type Resource,
  ALL_RESOURCES,
  RESOURCE_GROUPS,
  RESOURCE_LABELS,
  deriveAccessLevel,
  getResourcePermission,
} from "../types";
import { ACCESS_CONFIG, LEVEL_ORDER } from "./access-config";

const FIELD_SEP = "__";
const fieldName = (roleId: string, resource: Resource) =>
  `${roleId}${FIELD_SEP}${resource}`;

interface RolesTableBodyProps {
  roles: Role[];
  availableResources: string[];
  colCount: number;
  canCreate: boolean;
  canUpdate: boolean;
  onToggle: (role: Role, resource: Resource, next: AccessLevel) => void;
}

const RolesTableBody: FC<RolesTableBodyProps> = ({
  roles,
  availableResources,
  colCount,
  canCreate,
  canUpdate,
  onToggle,
}) => {
  const availableSet = useMemo(() => new Set(availableResources), [availableResources]);

  const filteredGroups = useMemo(() =>
    RESOURCE_GROUPS
      .map((g) => ({ ...g, resources: g.resources.filter((r) => availableSet.has(r)) }))
      .filter((g) => g.resources.length > 0),
    [availableSet],
  );

  const defaultValues = useMemo(() => {
    const vals: Record<string, AccessLevel> = {};
    for (const role of roles) {
      for (const resource of ALL_RESOURCES.filter((r) => availableSet.has(r))) {
        const perm = getResourcePermission(role.permissions, resource);
        vals[fieldName(role.id, resource)] = deriveAccessLevel(perm, resource);
      }
    }
    return vals;
  }, [roles, availableSet]);

  const form = useForm({ defaultValues });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const rolesById = useMemo(
    () => new Map(roles.map((r) => [r.id, r])),
    [roles],
  );

  const handleChange = (name: string, next: AccessLevel) => {
    if (!next) return;
    const [roleId, resource] = name.split(FIELD_SEP) as [string, Resource];
    const role = rolesById.get(roleId);
    if (!role || !role.name.trim()) return;
    onToggle(role, resource, next);
  };

  return (
    <tbody>
      {filteredGroups.map((group, gi) => (
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

              {roles.map((role) => (
                <td key={role.id}>
                  <form.Field name={fieldName(role.id, resource)}>
                    {(field) => {
                      const level = (field.state.value as AccessLevel) ?? "none";
                      const { icon: Icon, className } = ACCESS_CONFIG[level];

                      if (!canUpdate) {
                        return (
                          <span
                            className={cn(
                              "inline-flex w-full justify-center items-center py-3.5",
                              className,
                            )}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                          </span>
                        );
                      }

                      return (
                        <Select
                          value={level}
                          onValueChange={(v) => {
                            const next = v as AccessLevel;
                            field.handleChange(next);
                            handleChange(field.name, next);
                          }}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-full h-auto justify-center gap-0 py-3.5 px-0 border-0 rounded-none bg-transparent shadow-none hover:bg-muted/60 transition-colors [&>svg:last-child]:hidden",
                              className,
                            )}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                          </SelectTrigger>
                          <SelectContent align="start" position="popper">
                            {LEVEL_ORDER.map((lvl) => {
                              const {
                                icon: LvlIcon,
                                label: lvlLabel,
                                className: lvlClass,
                              } = ACCESS_CONFIG[lvl];
                              return (
                                <SelectItem
                                  key={lvl}
                                  value={lvl}
                                  className="text-xs"
                                >
                                  <LvlIcon
                                    className={cn(
                                      "w-3.5 h-3.5 shrink-0",
                                      lvlClass,
                                    )}
                                  />
                                  {lvl === "none" ? "No access" : lvlLabel}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  </form.Field>
                </td>
              ))}

              {canCreate && <td />}
            </tr>
          ))}
        </Fragment>
      ))}
    </tbody>
  );
};

export default RolesTableBody;
