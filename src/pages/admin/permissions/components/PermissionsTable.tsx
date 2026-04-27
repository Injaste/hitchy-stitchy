import { Fragment, type FC } from "react";
import { CheckCircle2, Eye, Minus, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoleCategory } from "../../types";

import {
  type CategoryPermissions,
  type AccessLevel,
  type Resource,
  CATEGORY_ORDER,
  CATEGORY_DISPLAY,
  RESOURCE_GROUPS,
  RESOURCE_LABELS,
  deriveAccessLevel,
} from "../types";

const ACCESS_CONFIG: Record<
  AccessLevel,
  { icon: typeof CheckCircle2; label: string; className: string }
> = {
  full: { icon: CheckCircle2, label: "Full", className: "text-primary" },
  write: { icon: PenLine, label: "Edit", className: "text-muted-foreground" },
  read: { icon: Eye, label: "View", className: "text-muted-foreground/60" },
  none: { icon: Minus, label: "—", className: "text-muted-foreground/25" },
};

const AccessCell = ({ level }: { level: AccessLevel }) => {
  const { icon: Icon, label, className } = ACCESS_CONFIG[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        className,
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {level !== "none" && <span>{label}</span>}
    </span>
  );
};

const PermissionsTable: FC<{ data: CategoryPermissions[] }> = ({ data }) => {
  const permMap = new Map<RoleCategory, Map<Resource, AccessLevel>>();

  for (const cat of data) {
    const resourceMap = new Map<Resource, AccessLevel>();

    if (cat.category === "root") {
      for (const resource of Object.keys(RESOURCE_LABELS) as Resource[]) {
        resourceMap.set(resource, "full");
      }
    } else {
      for (const perm of cat.permissions) {
        resourceMap.set(perm.resource as Resource, deriveAccessLevel(perm));
      }
    }

    permMap.set(cat.category, resourceMap);
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/40">
            <th className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground tracking-wide w-[36%]">
              Feature
            </th>
            {CATEGORY_ORDER.map((cat) => {
              const { label, description } = CATEGORY_DISPLAY[cat];
              return (
                <th key={cat} className="px-4 py-3.5 text-left w-[21%]">
                  <span className="block text-xs font-semibold text-foreground">
                    {label}
                  </span>
                  <span className="block text-[11px] text-muted-foreground/70 font-normal mt-0.5 leading-tight">
                    {description}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {RESOURCE_GROUPS.map((group, gi) => (
            <Fragment key={`group-${gi}`}>
              <tr className="border-t border-border/40 bg-muted/20">
                <td
                  colSpan={4}
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
                    ri === group.resources.length - 1 &&
                      "border-b border-border/30",
                  )}
                >
                  <td className="px-5 py-3.5 font-medium text-foreground/90">
                    {RESOURCE_LABELS[resource]}
                  </td>
                  {CATEGORY_ORDER.map((cat) => {
                    const level = permMap.get(cat)?.get(resource) ?? "none";
                    return (
                      <td key={cat} className="px-4 py-3.5">
                        <AccessCell level={level} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>

      <div className="px-5 py-3.5 border-t border-border/40 bg-muted/20 flex flex-wrap items-center gap-x-6 gap-y-2">
        {(
          Object.entries(ACCESS_CONFIG) as [
            AccessLevel,
            (typeof ACCESS_CONFIG)[AccessLevel],
          ][]
        ).map(([level, { icon: Icon, label, className }]) => (
          <span
            key={level}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs",
              className,
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {level === "none" ? "No access" : label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PermissionsTable;
